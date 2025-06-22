import { prisma } from "@/lib/prisma"
import { courseCodeMap } from "@/app/utils/courseCodeMap"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

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
    const { name, rollNo, batchId } = body

    // Validate required fields
    if (!name || !rollNo || !batchId) {
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
        batchId
      }
    })

    if (existingStudent) {
      return NextResponse.json({ error: "A student with this roll number already exists in this batch" }, { status: 409 })
    }

    // Get branch code from course
    const branchCode = courseCodeMap[batch.course] || 'student'
    if (!branchCode) {
      console.warn(`Course code not found for: ${batch.course}`)
    }

    const email = `${branchCode}${rollNo}@iiti.ac.in`

    const student = await prisma.student.create({
      data: {
        name,
        rollNo,
        email,
        batchId,
      },
    })

    return NextResponse.json({ student })
  } catch (error) {
    console.error("API POST /admin/batches/students error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
} 