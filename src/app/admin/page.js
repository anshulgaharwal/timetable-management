"use client"
import DashboardLayout from "../../components/DashboardLayout"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function AdminPage() {
  const { data: session } = useSession()
  const router = useRouter()

  const sidebarTabs = [
    { label: "Dashboard", href: "/admin" },
    // { label: "Manage Users", href: "/admin/users" },
    { label: "Professors", href: "/admin/professors" },
    // { label: "System Settings", href: "/admin/settings" },
  ]

  const actionButtons = [
    {
      label: "Add User",
      onClick: () => router.push("/admin/users/add"),
    },
    {
      label: "System Status",
      onClick: () => alert("System is running normally"),
    },
    {
      label: "Create Poll",
      onClick: () => router.push('/create'),
    },
    {
      label: "Poll Results",
      onClick: () => onClick={() => router.push('/result'),
  ]

  return (
    <DashboardLayout sidebarTabs={sidebarTabs} pageTitle="Admin Dashboard" actionButtons={actionButtons}>
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
