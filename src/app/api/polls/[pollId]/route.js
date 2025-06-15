import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

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
  } finally {
    await prisma.$disconnect()
  }
}

export async function PUT(request, { params }) {
  const { pollId } = params
  const { title, question, options, originalOptions } = await request.json()

  try {
    // Update the poll
    const updatedPoll = await prisma.poll.update({
      where: { id: pollId },
      data: {
        title,
        question,
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
  } finally {
    await prisma.$disconnect()
  }
}
