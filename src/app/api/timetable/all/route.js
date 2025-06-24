import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const entries = await prisma.timetableEntry.findMany({
    include: {
      course: true,
      professor: true,
    },
  })
  return NextResponse.json(entries)
}
