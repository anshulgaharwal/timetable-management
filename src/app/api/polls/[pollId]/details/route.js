import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request, { params }) {
  const { pollId } = params

  try {
    // Get poll with options in a single query
    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: {
        options: true,
      },
    })

    if (!poll) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 })
    }

    // Get response counts for each option in a single query
    const responses = await prisma.response.groupBy({
      by: ["optionId"],
      where: { pollId },
      _count: true,
    })

    // Format the response data
    const responsesByOption = poll.options.map((opt) => {
      const res = responses.find((r) => r.optionId === opt.id)
      return {
        optionId: opt.id,
        text: opt.text,
        count: res ? res._count : 0,
      }
    })

    // Return combined data
    return NextResponse.json({
      poll,
      responsesByOption,
    })
  } catch (error) {
    console.error("Error fetching poll details:", error)
    return NextResponse.json({ error: "Failed to fetch poll details" }, { status: 500 })
  }
}
