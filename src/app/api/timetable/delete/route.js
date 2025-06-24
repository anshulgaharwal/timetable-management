import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req) {
  const { day, timeSlot, batchId } = await req.json()

  await prisma.timetableEntry.deleteMany({
    where: {
      day,
      timeSlot,
      batchId: parseInt(batchId),
    },
  })

  return NextResponse.json({ success: true })
}
