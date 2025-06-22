import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(request, { params }) {
  const { pollId } = params

  try {
    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: {
        options: true,
      },
    })

    if (!poll) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 })
    }

    return NextResponse.json({ poll })
  } catch (error) {
    console.error("Error fetching poll:", error)
    return NextResponse.json({ error: "Failed to fetch poll" }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  const { pollId } = params

  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the poll to check ownership
    const existingPoll = await prisma.poll.findUnique({
      where: { id: pollId },
      select: { createdById: true }
    })

    if (!existingPoll) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 })
    }

    // Only allow the creator or admin to update the poll
    if (existingPoll.createdById !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { title, question, options, originalOptions, description, category, expiresAt, allowMultiple, batchId } = await request.json()

    // Update the poll
    const updatedPoll = await prisma.poll.update({
      where: { id: pollId },
      data: {
        title,
        question,
        description,
        category,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        allowMultiple: allowMultiple || false,
        batchId: batchId ? parseInt(batchId) : null,
        updatedAt: new Date(),
      },
    })

    // Handle options
    // First, determine which options are new, updated, or deleted
    const existingOptionMap = {}
    originalOptions.forEach((opt) => {
      existingOptionMap[opt.text] = opt.id
    })

    // Create new options and update existing ones
    for (const optionText of options) {
      if (existingOptionMap[optionText]) {
        // This option exists, no need to update as text is the same
        delete existingOptionMap[optionText] // Remove from map to track deleted options
      } else {
        // This is a new option
        await prisma.option.create({
          data: {
            text: optionText,
            pollId,
          },
        })
      }
    }

    // Delete options that are no longer in the list
    for (const deletedOptionId of Object.values(existingOptionMap)) {
      await prisma.option.delete({
        where: { id: deletedOptionId },
      })
    }

    // Fetch the updated poll with options
    const updatedPollWithOptions = await prisma.poll.findUnique({
      where: { id: pollId },
      include: {
        options: true,
      },
    })

    return NextResponse.json({ poll: updatedPollWithOptions })
  } catch (error) {
    console.error("Error updating poll:", error)
    return NextResponse.json({ error: "Failed to update poll" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  const { pollId } = params

  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the poll to check ownership
    const existingPoll = await prisma.poll.findUnique({
      where: { id: pollId },
      select: { createdById: true }
    })

    if (!existingPoll) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 })
    }

    // Only allow the creator or admin to delete the poll
    if (existingPoll.createdById !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Delete the poll (options and responses will be deleted automatically due to cascading)
    await prisma.poll.delete({
      where: { id: pollId },
    })

    return NextResponse.json({ message: "Poll deleted successfully" })
  } catch (error) {
    console.error("Error deleting poll:", error)
    return NextResponse.json({ error: "Failed to delete poll" }, { status: 500 })
  }
}
