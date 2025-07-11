import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(_, { params }) {
  const { batchId } = params

  const entries = await prisma.timetableEntry.findMany({
    where: { batchId: parseInt(batchId) },
    include: {
      professor: true,
      batch: true,
    },
  })

  return NextResponse.json(entries)
}
