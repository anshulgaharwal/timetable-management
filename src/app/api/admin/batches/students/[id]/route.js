import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import bcrypt from "bcrypt"

/**
 * GET /api/admin/batches/students/[id]
 * Get details of a specific student
 */
export async function GET(req, { params }) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is an admin
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const studentId = parseInt(params.id)

    // Validate studentId
    if (isNaN(studentId)) {
      return NextResponse.json({ error: "Invalid student ID" }, { status: 400 })
    }

    // Get student with batch details and user details
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        batch: true,
        user: {
          select: {
            name: true,
            email: true,
            role: true,
            image: true,
          },
        },
      },
    })

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    return NextResponse.json({ student })
  } catch (error) {
    console.error("API GET /admin/batches/students/[id] error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

/**
 * PUT /api/admin/batches/students/[id]
 * Update a specific student
 */
export async function PUT(req, { params }) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is an admin
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const studentId = parseInt(params.id)

    // Validate studentId
    if (isNaN(studentId)) {
      return NextResponse.json({ error: "Invalid student ID" }, { status: 400 })
    }

    const body = await req.json()
    const { name, rollNo, email, password } = body

    // Validate input
    if (!name || !rollNo || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if student exists
    const existingStudent = await prisma.student.findUnique({
      where: { id: studentId },
      include: { user: true },
    })

    if (!existingStudent) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    // Update in a transaction
    const result = await prisma.$transaction(async (prisma) => {
      // Prepare user update data
      const userData = {
        name,
        email,
      }

      // Only hash and update password if provided
      if (password) {
        userData.password = await bcrypt.hash(password, 12)
      }

      // Update user record
      const updatedUser = await prisma.user.update({
        where: { id: existingStudent.userId },
        data: userData,
        select: {
          name: true,
          email: true,
          role: true,
          image: true,
        },
      })

      // Update student record
      const updatedStudent = await prisma.student.update({
        where: { id: studentId },
        data: { rollNo },
      })

      return {
        ...updatedStudent,
        user: updatedUser,
      }
    })

    return NextResponse.json({ student: result })
  } catch (error) {
    console.error("API PUT /admin/batches/students/[id] error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/batches/students/[id]
 * Delete a specific student
 */
export async function DELETE(req, { params }) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is an admin
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const studentId = parseInt(params.id)

    // Validate studentId
    if (isNaN(studentId)) {
      return NextResponse.json({ error: "Invalid student ID" }, { status: 400 })
    }

    // Check if student exists
    const existingStudent = await prisma.student.findUnique({
      where: { id: studentId },
    })

    if (!existingStudent) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    // Delete in a transaction
    await prisma.$transaction(async (prisma) => {
      // Delete the student
      await prisma.student.delete({
        where: { id: studentId },
      })

      // Delete the associated user if it exists
      if (existingStudent.userId) {
        await prisma.user.delete({
          where: { id: existingStudent.userId },
        })
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("API DELETE /admin/batches/students/[id] error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
