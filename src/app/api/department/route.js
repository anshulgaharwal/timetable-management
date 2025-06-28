import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      include: {
        degree: true,
      },
    })
    return NextResponse.json(departments)
  } catch (error) {
    console.error("Error fetching departments:", error)
    return NextResponse.json({ error: "Failed to fetch departments" }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    // only admin can create a department
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const { name, code, degreeId } = await req.json()
    const department = await prisma.department.create({ data: { name, code, degreeId } })
    return NextResponse.json(department)
  } catch (error) {
    console.error("Error creating department:", error)
    return NextResponse.json({ error: "Failed to create department" }, { status: 500 })
  }
}

export async function PUT(req) {
  try {
    // only admin can update a department
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const { id, name, code, degreeId } = await req.json()
    const department = await prisma.department.update({
      data: { name, degreeId },
      where: { code: id },
    })
    return NextResponse.json(department)
  } catch (error) {
    console.error("Error updating department:", error)
    return NextResponse.json({ error: "Failed to update department" }, { status: 500 })
  }
}

export async function DELETE(req) {
  try {
    // only admin can delete a department
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const { id } = await req.json()
    const department = await prisma.department.delete({ where: { code: id } })
    return NextResponse.json(department)
  } catch (error) {
    console.error("Error deleting department:", error)
    return NextResponse.json({ error: "Failed to delete department" }, { status: 500 })
  }
}
