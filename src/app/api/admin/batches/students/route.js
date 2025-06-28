import { prisma } from "@/lib/prisma"
import { departmentCodeMap } from "@/app/utils/departmentCodeMap"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import bcrypt from "bcrypt"

/**
 * POST /api/admin/batches/students
 * Add a new student to a batch
 */
export async function POST(req) {
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

    const body = await req.json()
    const { name, rollNo, batchId, email, password } = body

    // Validate required fields
    if (!name || !rollNo || !batchId || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if batch exists
    const batch = await prisma.batch.findUnique({
      where: { id: batchId },
    })

    if (!batch) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 })
    }

    // Check if student with this roll number already exists in this batch
    const existingStudent = await prisma.student.findFirst({
      where: {
        rollNo,
        batchId,
      },
    })

    if (existingStudent) {
      return NextResponse.json({ error: "A student with this roll number already exists in this batch" }, { status: 409 })
    }

    // Check if user with this email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ error: "A user with this email already exists" }, { status: 409 })
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user and student in a transaction
    const result = await prisma.$transaction(async (prisma) => {
      // Create user first
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "student",
        },
      })

      // Create student linked to user
      const student = await prisma.student.create({
        data: {
          rollNo,
          batchId,
          userId: user.id,
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
              role: true,
            },
          },
        },
      })

      return student
    })

    return NextResponse.json({ student: result })
  } catch (error) {
    console.error("API POST /admin/batches/students error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
