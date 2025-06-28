import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

/**
 * GET /api/admin/batches
 * Get all batches with student counts
 */
export async function GET() {
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

    // Fetch all batches with student counts and related department/degree info
    const batches = await prisma.batch.findMany({
      include: {
        students: true,
        department: {
          include: {
            degree: true,
          },
        },
        _count: {
          select: { students: true },
        },
      },
      orderBy: [{ startYear: "desc" }, { departmentCode: "asc" }],
    })

    // Map the response to include the student count but not the full student data
    const formattedBatches = batches.map((batch) => ({
      id: batch.id,
      departmentCode: batch.departmentCode,
      departmentName: batch.department?.name || "Unknown Department",
      degreeCode: batch.department?.degreeId || "Unknown Degree",
      degreeName: batch.department?.degree?.name || "Unknown Degree",
      startYear: batch.startYear,
      endYear: batch.endYear,
      students: batch.students,
      studentCount: batch._count.students,
    }))

    return NextResponse.json({ batches: formattedBatches })
  } catch (error) {
    console.error("Error fetching batches:", error)
    return NextResponse.json({ error: "Failed to fetch batches" }, { status: 500 })
  }
}

/**
 * POST /api/admin/batches
 * Create a new batch
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
    const { degreeId, departmentCode, startYear, endYear } = body

    // Validate input
    if (!departmentCode || !startYear || !endYear) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate years
    if (endYear <= startYear) {
      return NextResponse.json({ error: "End year must be after start year" }, { status: 400 })
    }

    // Check if department exists
    const department = await prisma.department.findUnique({
      where: { code: departmentCode },
    })

    if (!department) {
      return NextResponse.json({ error: "Department not found" }, { status: 404 })
    }

    const batch = await prisma.batch.create({
      data: {
        departmentCode,
        startYear: parseInt(startYear),
        endYear: parseInt(endYear),
      },
    })

    return NextResponse.json({ batch })
  } catch (error) {
    console.error("API /admin/batches error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
