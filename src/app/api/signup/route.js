import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export async function POST(req) {
  const { name, email, password, role } = await req.json();
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role },
    });

    return new Response(JSON.stringify(user), { status: 201 });
  } catch (err) {
    return new Response("Email already exists", { status: 400 });
  }
}
