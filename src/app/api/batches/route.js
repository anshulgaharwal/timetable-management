import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch all batches
    const batches = await prisma.batch.findMany({
      orderBy: [
        { startYear: "desc" },
        { degree: "asc" },
        { course: "asc" }
      ]
    })

    return NextResponse.json({ batches })
  } catch (error) {
    console.error("Error fetching batches:", error)
    return NextResponse.json({ error: "Failed to fetch batches" }, { status: 500 })
  }
}
