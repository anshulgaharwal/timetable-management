"use client"
import DashboardLayout from "../../components/DashboardLayout"
import { useSession } from "next-auth/react"

export default function ProfessorPage() {
  const { data: session } = useSession()

  return (
    <DashboardLayout>
      <h1>Welcome Professor!</h1>
      <p>Hi {session?.user?.name}, here is your teaching panel.</p>
      <ul>
        <li>📚 Manage Classes</li>
        <li>🧑‍🎓 Students List</li>
        <li>🧾 Upload Grades</li>
      </ul>
    </DashboardLayout>
  )
}
