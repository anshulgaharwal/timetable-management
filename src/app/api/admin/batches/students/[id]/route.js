import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

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
    
    // Get student with batch details
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { batch: true }
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
    const { name, rollNo, email } = body
    
    // Validate input
    if (!name || !rollNo) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    
    // Check if student exists
    const existingStudent = await prisma.student.findUnique({
      where: { id: studentId }
    })
    
    if (!existingStudent) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }
    
    // Update student
    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: {
        name,
        rollNo,
        email: email || existingStudent.email
      }
    })
    
    return NextResponse.json({ student: updatedStudent })
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
      where: { id: studentId }
    })
    
    if (!existingStudent) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }
    
    // Delete the student
    await prisma.student.delete({
      where: { id: studentId }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("API DELETE /admin/batches/students/[id] error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
} 