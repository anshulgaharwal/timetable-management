import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { createUser, getUserByEmail } from "../../../lib/user-service"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"

const prisma = new PrismaClient()

// GET all professors
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const professors = await prisma.user.findMany({
      where: { role: "professor" },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
      orderBy: { name: "asc" },
    })

    return NextResponse.json(professors)
  } catch (error) {
    console.error("Error fetching professors:", error)
    return NextResponse.json({ message: "An internal server error occurred" }, { status: 500 })
  }
}

// POST - Create a new professor
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { name, email, password, role } = await req.json()

    if (!name || !email || !password || role !== "professor") {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    const existingUser = await getUserByEmail(email)

    if (existingUser) {
      return NextResponse.json({ message: "Email already exists" }, { status: 409 })
    }

    const newProfessor = await createUser({ name, email, password, role })

    // Don't return the password in the response
    const { password: _, ...professorWithoutPassword } = newProfessor

    return NextResponse.json(professorWithoutPassword, { status: 201 })
  } catch (error) {
    console.error("Error creating professor:", error)
    return NextResponse.json({ message: "An internal server error occurred" }, { status: 500 })
  }
}
