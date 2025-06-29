"use client"

import { usePathname } from "next/navigation"
import DashboardLayout from "../../../components/DashboardLayout"

export default function StudentPollsLayout({ children }) {
  const pathname = usePathname()

  const sidebarTabs = [
    { label: "Dashboard", href: "/student", icon: "🏠" },
    { label: "My Timetable", href: "/student/timetable", icon: "📅" },
    { label: "Polls", href: "/student/polls", icon: "🗳️" },
  ]

  const getPageTitle = () => {
    if (pathname === "/student") return "Student Dashboard"
    if (pathname === "/student/timetable") return "My Timetable"
    if (pathname === "/student/polls") return "Polls"
    if (pathname.startsWith("/student/polls/respond")) return "Respond to Poll"
    return "Student Portal"
  }

  return (
    <DashboardLayout sidebarTabs={sidebarTabs} title={getPageTitle()} role="student">
      {children}
    </DashboardLayout>
  )
}
