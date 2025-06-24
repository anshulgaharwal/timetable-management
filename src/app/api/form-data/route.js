import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const courses = await prisma.course.findMany()
  const professors = await prisma.user.findMany({ where: { role: 'professor' } })
  const batches = await prisma.batch.findMany()
  return NextResponse.json({ courses, professors, batches })
}
