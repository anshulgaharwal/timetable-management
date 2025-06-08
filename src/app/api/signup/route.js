import { NextResponse } from "next/server"
import { createUser, getUserByEmail } from "../../../lib/user-service"

export async function POST(req) {
  try {
    const { name, email, password, role } = await req.json()

    if (!name || !email || !password || !role) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    const existingUser = await getUserByEmail(email)

    if (existingUser) {
      return NextResponse.json({ message: "Email already exists" }, { status: 409 })
    }

    const newUser = await createUser({ name, email, password, role })

    return NextResponse.json(newUser, { status: 201 })
  } catch (error) {
    console.error("Signup API error:", error)
    return NextResponse.json({ message: "An internal server error occurred" }, { status: 500 })
  }
}
