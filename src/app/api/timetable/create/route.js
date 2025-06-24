import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req) {
  const data = await req.json()

  // Conflict detection
  const conflict = await prisma.timetableEntry.findFirst({
    where: {
      day: data.day,
      timeSlot: data.timeSlot,
      batchId: parseInt(data.batchId),
    },
  })

  if (conflict) {
    return NextResponse.json({ error: 'Time slot already taken for this batch.' }, { status: 409 })
  }

  const entry = await prisma.timetableEntry.create({
    data: {
      day: data.day,
      timeSlot: data.timeSlot,
      classroom: data.classroom,
      courseCode: data.courseCode,
      professorId: data.professorId,
      batchId: parseInt(data.batchId),
    },
  })

  return NextResponse.json({ success: true, entry })
}
