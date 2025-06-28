import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

/**
 * GET /api/admin/batches/[id]
 * Get details of a specific batch with its students
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

    const batchId = parseInt(params.id)

    // Validate batchId
    if (isNaN(batchId)) {
      return NextResponse.json({ error: "Invalid batch ID" }, { status: 400 })
    }

    // Get batch with its students and department/degree info
    const batch = await prisma.batch.findUnique({
      where: { id: batchId },
      include: {
        students: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                role: true,
                image: true,
              },
            },
          },
        },
        department: {
          include: {
            degree: true,
          },
        },
      },
    })

    if (!batch) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 })
    }

    return NextResponse.json({ batch })
  } catch (error) {
    console.error("API /admin/batches/[id] error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

/**
 * PUT /api/admin/batches/[id]
 * Update a specific batch
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

    const batchId = parseInt(params.id)

    // Validate batchId
    if (isNaN(batchId)) {
      return NextResponse.json({ error: "Invalid batch ID" }, { status: 400 })
    }

    const body = await req.json()
    const { departmentCode, startYear, endYear } = body

    // Validate input
    if (!departmentCode || !startYear || !endYear) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate years
    if (endYear <= startYear) {
      return NextResponse.json({ error: "End year must be after start year" }, { status: 400 })
    }

    // Check if batch exists
    const existingBatch = await prisma.batch.findUnique({
      where: { id: batchId },
    })

    if (!existingBatch) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 })
    }

    // Check if department exists
    const department = await prisma.department.findUnique({
      where: { code: departmentCode },
    })

    if (!department) {
      return NextResponse.json({ error: "Department not found" }, { status: 404 })
    }

    // Update batch
    const updatedBatch = await prisma.batch.update({
      where: { id: batchId },
      data: {
        departmentCode,
        startYear: parseInt(startYear),
        endYear: parseInt(endYear),
      },
    })

    return NextResponse.json({ batch: updatedBatch })
  } catch (error) {
    console.error("API PUT /admin/batches/[id] error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/batches/[id]
 * Delete a specific batch and its students
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

    const batchId = parseInt(params.id)

    // Validate batchId
    if (isNaN(batchId)) {
      return NextResponse.json({ error: "Invalid batch ID" }, { status: 400 })
    }

    // Check if batch exists
    const existingBatch = await prisma.batch.findUnique({
      where: { id: batchId },
      include: {
        students: true,
      },
    })

    if (!existingBatch) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 })
    }

    // Get all user IDs associated with students in this batch
    const userIds = existingBatch.students.map((student) => student.userId).filter(Boolean)

    // Use a transaction to ensure all related records are deleted properly
    await prisma.$transaction(async (prisma) => {
      // Delete all students in this batch first
      await prisma.student.deleteMany({
        where: { batchId },
      })

      // Delete associated user accounts
      if (userIds.length > 0) {
        await prisma.user.deleteMany({
          where: {
            id: {
              in: userIds,
            },
          },
        })
      }

      // Delete the batch
      await prisma.batch.delete({
        where: { id: batchId },
      })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("API DELETE /admin/batches/[id] error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
