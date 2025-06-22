import { prisma } from "@/lib/prisma"
import { courseCodeMap } from "@/app/utils/courseCodeMap"
export async function POST(req) {
  try {
    const body = await req.json()
    const { name, rollNo, batchId } = body

    const batch = await prisma.batch.findUnique({
      where: { id: batchId },
    })

    if (!batch) {
      return new Response(JSON.stringify({ error: "Batch not found" }), { status: 404 })
    }

    // Get branch code from course
    const branchCode = courseCodeMap[batch.course]
    if (!branchCode) {
      return new Response(JSON.stringify({ error: "Course code not found" }), { status: 400 })
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

    return Response.json({ student })
  } catch (error) {
    console.error("Add student error:", error)
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 })
  }
}
