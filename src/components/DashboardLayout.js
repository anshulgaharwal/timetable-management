"use client"

import { useSession, signOut } from "next-auth/react"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect, useTransition } from "react"
import { useLayout } from "../contexts/LayoutContext"
import "../styles/dashboard.css"

export default function DashboardLayout({ children }) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const router = useRouter()
  const [isMobile, setIsMobile] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Get layout state from context
  const { pageTitle, actionButtons, sidebarTabs, isMobileSidebarOpen, setIsMobileSidebarOpen } = useLayout()

  // Handle responsive design
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Close mobile sidebar when route changes
  useEffect(() => {
    setIsMobileSidebarOpen(false)
  }, [pathname, setIsMobileSidebarOpen])

  const handleSignOut = async () => {
    try {
      await signOut({ callbackUrl: "/signin" })
    } catch (error) {
      console.error("Sign out error:", error)
    }
  }

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen)
  }

  const handleNavigation = (href) => {
    if (href === pathname) return

    startTransition(() => {
      router.push(href)
    })
  }

  const isTabActive = (href) => {
    if (href === "/admin") {
      return pathname === "/admin"
    }
    return pathname.startsWith(href)
  }

  return (
    <div className="dashboard-container">
      {/* Mobile overlay */}
      {isMobile && isMobileSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsMobileSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`sidebar ${isMobile && !isMobileSidebarOpen ? "sidebar-hidden" : ""}`}>
        <div className="sidebar-logo">
          <h2>Timetable System</h2>
        </div>

        <nav className="sidebar-tabs">
          {sidebarTabs.map((tab) => (
            <button key={tab.href} onClick={() => handleNavigation(tab.href)} className={isTabActive(tab.href) ? "active" : ""} disabled={isPending}>
              {tab.icon && <span className="tab-icon">{tab.icon}</span>}
              {tab.label}
            </button>
          ))}
        </nav>

        {session && (
          <div className="sidebar-user">
            <div className="user-name">{session.user?.name}</div>
            <div className="user-role">{session.user?.role || "User"}</div>
            <button onClick={handleSignOut}>Sign Out</button>
          </div>
        )}
      </aside>

      {/* Main content area */}
      <main className="main">
        {/* Header */}
        <header className="navbar">
          {isMobile && (
            <button className="mobile-menu-toggle" onClick={toggleMobileSidebar}>
              <span></span>
              <span></span>
              <span></span>
            </button>
          )}

          <h1 className="page-title">{pageTitle}</h1>

          {actionButtons.length > 0 && (
            <div className="action-buttons">
              {actionButtons.map((button, index) => (
                <button key={index} onClick={button.onClick} disabled={button.disabled || isPending} className={button.variant || "primary"}>
                  {button.icon && <span className="button-icon">{button.icon}</span>}
                  {button.label}
                </button>
              ))}
            </div>
          )}
        </header>

        {/* Page content */}
        <div className="content">{children}</div>
      </main>
    </div>
  )
}
