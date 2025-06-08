import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req) {
  const { email, role } = await req.json();

  if (!email || !role) {
    return new Response(JSON.stringify({ error: 'Missing email or role' }), { status: 400 });
  }

  await prisma.user.update({
    where: { email },
    data: { role },
  });

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
