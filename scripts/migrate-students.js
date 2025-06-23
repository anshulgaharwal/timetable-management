const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcrypt")
const prisma = new PrismaClient()

async function migrateStudents() {
  console.log("Starting student migration...")

  try {
    // Get all students that don't have a userId
    const students = await prisma.student.findMany({
      where: {
        userId: null,
      },
    })

    console.log(`Found ${students.length} students without user accounts.`)

    if (students.length === 0) {
      console.log("No students to migrate.")
      return
    }

    // Process each student
    for (const student of students) {
      try {
        // Generate a default password (you might want to change this)
        const defaultPassword = `student${student.rollNo}`
        const hashedPassword = await bcrypt.hash(defaultPassword, 12)

        // Create a user for this student
        const user = await prisma.user.create({
          data: {
            // Use existing name if available, otherwise use "Student" + rollNo
            name: student.name || `Student ${student.rollNo}`,
            // Use existing email if available, otherwise create a default one
            email: student.email || `student${student.rollNo}@example.com`,
            password: hashedPassword,
            role: "student",
          },
        })

        // Link the student to the user
        await prisma.student.update({
          where: { id: student.id },
          data: { userId: user.id },
        })

        console.log(`Migrated student ID ${student.id}, Roll No ${student.rollNo}`)
      } catch (error) {
        console.error(`Failed to migrate student ID ${student.id}:`, error)
      }
    }

    console.log("Student migration completed.")
  } catch (error) {
    console.error("Migration failed:", error)
  } finally {
    await prisma.$disconnect()
  }
}

migrateStudents().catch((e) => {
  console.error(e)
  process.exit(1)
})
