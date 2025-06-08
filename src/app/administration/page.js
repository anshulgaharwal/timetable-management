"use client"
import DashboardLayout from "../../components/DashboardLayout"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function AdministrationPage() {
  const { data: session } = useSession()
  const router = useRouter()

  const sidebarTabs = [
    { label: "Dashboard", href: "/administration" },
    // { label: "Manage Users", href: "/administration/users" },
    { label: "Professors", href: "/administration/professors" },
    // { label: "System Settings", href: "/administration/settings" },
  ]

  const actionButtons = [
    {
      label: "Add User",
      onClick: () => router.push("/administration/users/add"),
    },
    {
      label: "System Status",
      onClick: () => alert("System is running normally"),
    },
  ]

  return (
    <DashboardLayout sidebarTabs={sidebarTabs} pageTitle="Administration Dashboard" actionButtons={actionButtons}>
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
