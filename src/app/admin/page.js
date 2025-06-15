"use client"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useAdmin } from "../../contexts/AdminContext"

export default function AdminPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { setActionButtons } = useAdmin()

  useEffect(() => {
    setActionButtons([
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
        onClick: () => router.push("/create"),
      },
      {
        label: "Poll Results",
        onClick: () => router.push("/result"),
      },
    ])

    // Clean up when unmounting
    return () => setActionButtons([])
  }, [setActionButtons, router])

  return (
    <div className="admin-content">
      <h1>Welcome Administrator!</h1>
      <p>Hi {session?.user?.name}, manage the system.</p>
      <ul>
        <li>Manage Users</li>
        <li>Manage Professors</li>
        <li>System Settings</li>
      </ul>
    </div>
  )
}
