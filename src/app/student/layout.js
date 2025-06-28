"use client"

import { usePathname } from "next/navigation"
import DashboardLayout from "../../components/DashboardLayout"

export default function StudentLayout({ children }) {
  const pathname = usePathname()

  const sidebarTabs = [
    { label: "Dashboard", href: "/student", icon: "🏠" },
    { label: "My Timetable", href: "/student/timetable", icon: "📅" },
  ]

  const getPageTitle = () => {
    if (pathname === "/student") return "Student Dashboard"
    if (pathname === "/student/timetable") return "My Timetable"
    return "Student Portal"
  }

  return (
    <DashboardLayout 
      sidebarTabs={sidebarTabs} 
      title={getPageTitle()}
      role="student"
    >
      {children}
    </DashboardLayout>
  )
}
