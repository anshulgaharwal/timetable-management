"use client"
import DashboardLayout from "../../components/DashboardLayout"
import { useSession } from "next-auth/react"

export default function ProfessorPage() {
  const { data: session } = useSession()

  const sidebarTabs = [
    { label: "Dashboard", href: "/professor" },
    { label: "Manage Classes", href: "/professor/classes" },
    { label: "Students List", href: "/professor/students" },
    { label: "Upload Grades", href: "/professor/grades" },
    { label: "Profile", href: "/professor/profile" },
    { label: "Settings", href: "/professor/settings" },
  ]

  return (
    <DashboardLayout sidebarTabs={sidebarTabs}>
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
