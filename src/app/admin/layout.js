"use client"

import { usePathname } from "next/navigation"
import { useEffect } from "react"
import DashboardLayout from "../../components/DashboardLayout"
import { AdminProvider } from "../../contexts/AdminContext"
import { useLayout } from "../../contexts/LayoutContext"

const adminSidebarTabs = [
  { label: "Dashboard", href: "/admin", icon: "🏠" },
  { label: "Professors", href: "/admin/professors", icon: "👨‍🏫" },
  { label: "Batches", href: "/admin/batches", icon: "👥" },
  { label: "Polls", href: "/admin/polls", icon: "📊" },
  // { label: "Settings", href: "/admin/settings", icon: "⚙️" },
  { label: "Degrees", href: "/admin/degrees", icon: "🎓" },
  { label: "Timetable", href: "/admin/timetable", icon: "📅" },
]

export default function AdminLayoutContent({ children }) {
  const pathname = usePathname()
  const { setPageTitle, setSidebarTabs } = useLayout()

  // Determine page title based on pathname
  const getPageTitle = () => {
    if (pathname === "/admin") return "Admin Dashboard"
    if (pathname === "/admin/professors") return "Manage Professors"
    if (pathname === "/admin/polls") return "Manage Polls"
    if (pathname === "/admin/batches") return "Manage Batches"
    if (pathname.startsWith("/admin/batches/create")) return "Create New Batch"
    if (pathname.match(/\/admin\/batches\/\d+/)) return "Batch Details"
    if (pathname === "/admin/settings") return "Settings"
    if (pathname === "/admin/degrees") return "Manage Degrees"
    if (pathname.match(/\/admin\/degrees\/[A-Za-z0-9]+/)) return "Degree Departments"
    return "Admin"
  }

  useEffect(() => {
    // Set the page title and sidebar tabs for admin
    setPageTitle(getPageTitle())
    setSidebarTabs(adminSidebarTabs)
  }, [pathname, setPageTitle, setSidebarTabs])

  return (
    <AdminProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </AdminProvider>
  )
}
