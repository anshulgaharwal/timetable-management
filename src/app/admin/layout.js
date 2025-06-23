"use client"

import { usePathname } from "next/navigation"
import DashboardLayout from "../../components/DashboardLayout"
import { AdminProvider } from "../../contexts/AdminContext"

const adminSidebarTabs = [
  { label: "Dashboard", href: "/admin" },
  { label: "Professors", href: "/admin/professors" },
  { label: "Batches", href: "/admin/batches" },
  { label: "Polls", href: "/admin/polls" },
  { label: "Settings", href: "/admin/settings" },
  { label: "Degrees", href: "/admin/degrees" },
]

export default function AdminLayout({ children }) {
  const pathname = usePathname()

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
    if (pathname.match(/\/admin\/degrees\/[A-Za-z0-9]+/)) return "Degree Courses"
    return "Admin"
  }

  return (
    <AdminProvider>
      <DashboardLayout sidebarTabs={adminSidebarTabs} pageTitle={getPageTitle()}>
        {children}
      </DashboardLayout>
    </AdminProvider>
  )
}
