import { prisma } from "@/app/lib/prisma";
export async function GET() {
  const batches = await prisma.batch.findMany({
    include: { students: true },
  });
  return Response.json({ batches });
}
