import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"

export async function getUserByEmail(email) {
  try {
    return await prisma.user.findUnique({ where: { email } })
  } catch (error) {
    console.error("Database error in getUserByEmail:", error)
    throw new Error("Failed to retrieve user from database.")
  }
}

export async function createUser(userData) {
  const { name, email, password, role } = userData

  try {
    const hashedPassword = await bcrypt.hash(password, 12)
    return await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    })
  } catch (error) {
    console.error("Database error in createUser:", error)
    throw new Error("Failed to create user.")
  }
}
