"use client"
import { useEffect } from "react"
import { usePathname } from "next/navigation"
import DashboardLayout from "../../components/DashboardLayout"
import { useLayout } from "../../contexts/LayoutContext"
import { StudentProvider } from "../../contexts/StudentContext"

const sidebarTabs = [
  { label: "Dashboard", href: "/student", icon: "🏠" },
  { label: "My Timetable", href: "/student/timetable", icon: "📅" },
  { label: "Polls", href: "/student/polls", icon: "🗳️" },
]
export default function StudentLayout({ children }) {
  const pathname = usePathname()
  const { setPageTitle, setSidebarTabs } = useLayout()

  const getPageTitle = () => {
    if (pathname === "/student") return "Student Dashboard"
    if (pathname === "/student/timetable") return "Weekly Timetable"
    if (pathname === "/student/polls") return "Polls"
    if (pathname.startsWith("/student/polls/respond")) return "Respond to Poll"
    return "Student Portal"
  }

  useEffect(() => {
    // Set the page title and sidebar tabs for student
    setPageTitle(getPageTitle())
    setSidebarTabs(sidebarTabs)
  }, [pathname, setPageTitle, setSidebarTabs])

  return (
    <StudentProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </StudentProvider>
  )
}
