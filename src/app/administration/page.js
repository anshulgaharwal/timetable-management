"use client"
import DashboardLayout from "../../components/DashboardLayout"
import { useSession } from "next-auth/react"

export default function AdministrationPage() {
  const { data: session } = useSession()

  const sidebarTabs = [
    { label: "Dashboard", href: "/administration" },
    { label: "Manage Users", href: "/administration/users" },
    { label: "Professors", href: "/administration/professors" },
    { label: "System Settings", href: "/administration/settings" },
  ]

  return (
    <DashboardLayout sidebarTabs={sidebarTabs}>
      <h1>Welcome Administrator!</h1>
      <p>Hi {session?.user?.name}, manage the system.</p>
      <ul>
        <li>Manage Users</li>
        <li>Manage Professors</li>
        <li>System Settings</li>
      </ul>
    </DashboardLayout>
  )
}
