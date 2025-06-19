import { prisma } from "@/app/lib/prisma";

export async function GET(_, { params }) {
  const batchId = parseInt(params.id);
  const students = await prisma.student.findMany({
    where: { batchId },
  });
  return Response.json({ students });
}
