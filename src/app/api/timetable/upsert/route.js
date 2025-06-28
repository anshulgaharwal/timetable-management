import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req) {
  const data = await req.json()

  const existing = await prisma.timetableEntry.findFirst({
    where: {
      day: data.day,
      timeSlot: data.timeSlot,
      batchId: parseInt(data.batchId),
    },
  })

  const entry = existing
    ? await prisma.timetableEntry.update({
        where: { id: existing.id },
        data: {
          departmentCode: data.departmentCode || existing.departmentCode,
          professorId: data.professorId || existing.professorId,
          classroom: data.classroom || existing.classroom,
        },
        include: { department: true, professor: true }
      })
    : await prisma.timetableEntry.create({
        data: {
          day: data.day,
          timeSlot: data.timeSlot,
          batchId: parseInt(data.batchId),
          departmentCode: data.departmentCode,
          professorId: data.professorId,
          classroom: data.classroom,
        },
        include: { department: true, professor: true }
      })

  return NextResponse.json(entry)
}
