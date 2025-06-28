"use client"

import { usePathname } from "next/navigation"
import DashboardLayout from "../../components/DashboardLayout"

export default function ProfessorLayout({ children }) {
  const pathname = usePathname()

  const sidebarTabs = [
    { label: "Dashboard", href: "/professor", icon: "🏠" },
    { label: "My Timetable", href: "/professor/timetable", icon: "📅" },
  ]

  const getPageTitle = () => {
    if (pathname === "/professor") return "Professor Dashboard"
    if (pathname === "/professor/timetable") return "My Timetable"
    return "Professor Portal"
  }

  return (
    <DashboardLayout 
      sidebarTabs={sidebarTabs} 
      title={getPageTitle()}
      role="professor"
    >
      {children}
    </DashboardLayout>
  )
}
