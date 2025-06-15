"use client"

import { usePathname } from "next/navigation"
import DashboardLayout from "../../components/DashboardLayout"
import { AdminProvider } from "../../contexts/AdminContext"

const adminSidebarTabs = [
  { label: "Dashboard", href: "/admin" },
  { label: "Professors", href: "/admin/professors" },
]

export default function AdminLayout({ children }) {
  const pathname = usePathname()

  // Determine page title based on pathname
  const getPageTitle = () => {
    if (pathname === "/admin") return "Admin Dashboard"
    if (pathname === "/admin/professors") return "Manage Professors"
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
