"use client"
import DashboardLayout from "../../components/DashboardLayout"
import { useSession } from "next-auth/react"

export default function StudentDashboard() {
  const { data: session } = useSession()

  return (
    <DashboardLayout>
      <h1>Welcome Student!</h1>
      <p>Hello {session?.user?.name}, explore your dashboard.</p>
      <ul>
        <li>📘 Your Courses</li>
        <li>📝 Assignments</li>
        <li>📊 Grades</li>
      </ul>
    </DashboardLayout>
  )
}
