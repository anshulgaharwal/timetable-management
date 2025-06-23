import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("Fetching degrees")
    const degrees = await prisma.degree.findMany({
      include: {
        courses: true,
      },
    })
    console.log(degrees)
    return NextResponse.json(degrees)
  } catch (error) {
    console.error("Error fetching degrees:", error)
    return NextResponse.json({ error: "Failed to fetch degrees" }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const { name, code } = await req.json()
    const degree = await prisma.degree.create({ data: { name, code } })
    return NextResponse.json(degree)
  } catch (error) {
    return NextResponse.json({ error: "Failed to create degree" }, { status: 500 })
  }
}

export async function PUT(req) {
  try {
    const { id, name, code } = await req.json()
    const degree = await prisma.degree.update({
      data: { name },
      where: { code: id },
    })
    return NextResponse.json(degree)
  } catch (error) {
    console.error("Error updating degree:", error)
    return NextResponse.json({ error: "Failed to update degree" }, { status: 500 })
  }
}

export async function DELETE(req) {
  try {
    const { id } = await req.json()
    const degree = await prisma.degree.delete({ where: { code: id } })
    return NextResponse.json(degree)
  } catch (error) {
    console.error("Error deleting degree:", error)
    return NextResponse.json({ error: "Failed to delete degree" }, { status: 500 })
  }
}
