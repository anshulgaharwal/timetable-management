"use client"

import { usePathname } from "next/navigation"
import DashboardLayout from "../../components/DashboardLayout"
import { AdminProvider } from "../../contexts/AdminContext"

const adminSidebarTabs = [
  { label: "Dashboard", href: "/admin" },
  { label: "Professors", href: "/admin/professors" },
  { label: "Polls", href: "/admin/polls" },
]

export default function AdminLayout({ children }) {
  const pathname = usePathname()

  // Determine page title based on pathname
  const getPageTitle = () => {
    if (pathname === "/admin") return "Admin Dashboard"
    if (pathname === "/admin/professors") return "Manage Professors"
    if (pathname === "/admin/polls") return "Manage Polls"
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
