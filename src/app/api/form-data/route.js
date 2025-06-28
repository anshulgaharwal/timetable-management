import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const departments = await prisma.department.findMany()
  const professors = await prisma.user.findMany({ where: { role: 'professor' } })
  const batches = await prisma.batch.findMany()
  return NextResponse.json({ departments, professors, batches })
}
