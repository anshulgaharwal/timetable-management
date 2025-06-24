import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const entries = await prisma.timetableEntry.findMany({
    include: { professor: true, course: true }
  })
  return NextResponse.json(entries)
}
