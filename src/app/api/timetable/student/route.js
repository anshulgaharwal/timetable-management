import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const student = await prisma.student.findUnique({
    where: { userId: session.user.id },
  })

  if (!student) {
    return NextResponse.json({ error: "Student record not found" }, { status: 404 })
  }

  const entries = await prisma.timetableEntry.findMany({
    where: { batchId: student.batchId },
    include: {
      department: true,
      professor: true,
    },
  })

  return NextResponse.json(entries)
}
