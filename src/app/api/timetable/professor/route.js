import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"

export async function GET(req) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "professor") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const entries = await prisma.timetableEntry.findMany({
    where: { professorId: session.user.id },
    include: {
      department: true,
      professor: true,
    },
  })

  return NextResponse.json(entries)
}
