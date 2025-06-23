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

    // Fetch all batches with student counts and related course/degree info
    const batches = await prisma.batch.findMany({
      include: {
        students: true,
        course: {
          include: {
            degree: true,
          },
        },
        _count: {
          select: { students: true },
        },
      },
      orderBy: [{ startYear: "desc" }, { courseCode: "asc" }],
    })

    // Map the response to include the student count but not the full student data
    const formattedBatches = batches.map((batch) => ({
      id: batch.id,
      courseCode: batch.courseCode,
      courseName: batch.course?.name || "Unknown Course",
      degreeCode: batch.course?.degreeId || "Unknown Degree",
      degreeName: batch.course?.degree?.name || "Unknown Degree",
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
    const { degreeId, courseCode, startYear, endYear } = body

    // Validate input
    if (!courseCode || !startYear || !endYear) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate years
    if (endYear <= startYear) {
      return NextResponse.json({ error: "End year must be after start year" }, { status: 400 })
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { code: courseCode },
    })

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    const batch = await prisma.batch.create({
      data: {
        courseCode,
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
