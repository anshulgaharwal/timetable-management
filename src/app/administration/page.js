"use client"
import DashboardLayout from "../../components/DashboardLayout"
import { useSession } from "next-auth/react"

export default function AdministrationPage() {
  const { data: session } = useSession()

  return (
    <DashboardLayout>
      <h1>Welcome Administrator!</h1>
      <p>Hi {session?.user?.name}, manage the system.</p>
      <ul>
        <li>Manage Users</li>
        <li>System Settings</li>
      </ul>
    </DashboardLayout>
  )
}
