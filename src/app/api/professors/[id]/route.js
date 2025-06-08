import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth"
import bcrypt from "bcrypt"
import { authOptions } from "../../auth/[...nextauth]/route"

const prisma = new PrismaClient()

// GET a specific professor
export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== "administration") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    const professor = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    })

    if (!professor || professor.role !== "professor") {
      return NextResponse.json({ message: "Professor not found" }, { status: 404 })
    }

    return NextResponse.json(professor)
  } catch (error) {
    console.error("Error fetching professor:", error)
    return NextResponse.json({ message: "An internal server error occurred" }, { status: 500 })
  }
}

// PUT - Update a professor
export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== "administration") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    const { name, email, password } = await req.json()

    // Check if professor exists
    const existingProfessor = await prisma.user.findUnique({
      where: { id },
    })

    if (!existingProfessor || existingProfessor.role !== "professor") {
      return NextResponse.json({ message: "Professor not found" }, { status: 404 })
    }

    // Prepare update data
    const updateData = { name, email }

    // If password is provided, hash it
    if (password) {
      updateData.password = await bcrypt.hash(password, 12)
    }

    // Update the professor
    const updatedProfessor = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    })

    return NextResponse.json(updatedProfessor)
  } catch (error) {
    console.error("Error updating professor:", error)
    return NextResponse.json({ message: "An internal server error occurred" }, { status: 500 })
  }
}

// DELETE - Delete a professor
export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== "administration") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    // Check if professor exists
    const existingProfessor = await prisma.user.findUnique({
      where: { id },
    })

    if (!existingProfessor || existingProfessor.role !== "professor") {
      return NextResponse.json({ message: "Professor not found" }, { status: 404 })
    }

    // Delete the professor
    await prisma.user.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Professor deleted successfully" })
  } catch (error) {
    console.error("Error deleting professor:", error)
    return NextResponse.json({ message: "An internal server error occurred" }, { status: 500 })
  }
}
