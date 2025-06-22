import { prisma } from "@/lib/prisma"
export async function GET() {
  const batches = await prisma.batch.findMany({
    include: { students: true },
  })
  return Response.json({ batches })
}
