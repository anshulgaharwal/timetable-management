import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function PUT(request, { params }) {
  const { pollId } = params
  const { isActive } = await request.json()

  try {
    const updatedPoll = await prisma.poll.update({
      where: { id: pollId },
      data: { isActive },
    })

    return NextResponse.json({ poll: updatedPoll })
  } catch (error) {
    console.error("Error toggling poll status:", error)
    return NextResponse.json({ error: "Failed to update poll status" }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
