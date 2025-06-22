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

    // Fetch all batches with student counts
    const batches = await prisma.batch.findMany({
      include: {
        students: true,
        _count: {
          select: { students: true }
        }
      },
      orderBy: [
        { startYear: "desc" },
        { degree: "asc" },
        { course: "asc" }
      ]
    })

    // Map the response to include the student count but not the full student data
    const formattedBatches = batches.map(batch => ({
      id: batch.id,
      degree: batch.degree,
      course: batch.course,
      startYear: batch.startYear,
      endYear: batch.endYear,
      students: batch.students,
      studentCount: batch._count.students
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
    const { degree, course, startYear, endYear } = body

    // Validate input
    if (!degree || !course || !startYear || !endYear) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate years
    if (endYear <= startYear) {
      return NextResponse.json({ error: "End year must be after start year" }, { status: 400 })
    }

    const batch = await prisma.batch.create({
      data: {
        degree,
        course,
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