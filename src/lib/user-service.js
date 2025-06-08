import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"

const prisma = new PrismaClient()

/**
 * Finds a user by their email address.
 * @param {string} email - The user's email.
 * @returns {Promise<User|null>} The user object or null if not found.
 */
export async function getUserByEmail(email) {
  try {
    return await prisma.user.findUnique({ where: { email } })
  } catch (error) {
    console.error("Database error in getUserByEmail:", error)
    throw new Error("Failed to retrieve user from database.")
  }
}

/**
 * Creates a new user in the database.
 * @param {object} userData - The user's data.
 * @param {string} userData.name - The user's name.
 * @param {string} userData.email - The user's email.
 * @param {string} userData.password - The user's plain text password.
 * @param {string} userData.role - The user's role.
 * @returns {Promise<User>} The created user object.
 */
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
    // Re-throw a more generic error to avoid leaking implementation details
    throw new Error("Failed to create user.")
  }
}
