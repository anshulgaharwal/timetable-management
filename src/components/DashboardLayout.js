"use client"
import { useSession, signOut } from "next-auth/react"
import { usePathname, useRouter } from "next/navigation"
import "../styles/dashboard.css"
import Link from "next/link"
import { useAdmin } from "../contexts/AdminContext"
import { useState, useEffect } from "react"

export default function DashboardLayout({ children, sidebarTabs, pageTitle, actionButtons: propsActionButtons }) {
  const { data: session } = useSession()
  const path = usePathname()
  const router = useRouter()
  const [isMobile, setIsMobile] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  // Always call the hook unconditionally
  const adminContext = useAdmin()
  // Then check if we have action buttons from context or props
  const actionButtons = adminContext?.actionButtons || propsActionButtons || []

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkScreenSize()
    window.addEventListener("resize", checkScreenSize)

    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push("/")
  }

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen((prev) => !prev)
  }

  return (
    <div className="dashboard-container">
      {isMobile && (
        <button className="mobile-menu-toggle" onClick={toggleMobileSidebar} aria-label="Toggle menu">
          <span></span>
          <span></span>
          <span></span>
        </button>
      )}

      <div className={`sidebar ${isMobile && mobileSidebarOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-logo">
          <span>TMS</span>
        </div>

        <div className="sidebar-tabs">
          {sidebarTabs &&
            sidebarTabs.map((tab, index) => (
              <Link key={index} href={tab.href} className={path === tab.href ? "active" : ""} onClick={() => isMobile && setMobileSidebarOpen(false)}>
                {tab.icon && <span className="tab-icon">{tab.icon}</span>}
                <span>{tab.label}</span>
              </Link>
            ))}
        </div>

        <div className="sidebar-user">
          <span className="user-name">{session?.user?.name || "User"}</span>
          <span className="user-role">{session?.user?.role || "Guest"}</span>
          <button onClick={handleSignOut}>Sign out</button>
        </div>
      </div>

      <div className="main">
        <div className="navbar">
          <div className="page-title">{pageTitle || "Dashboard"}</div>
          <div className="action-buttons">
            {actionButtons &&
              actionButtons.map((button, index) => (
                <button key={index} onClick={button.onClick} className={button.className || ""} disabled={button.disabled}>
                  {button.icon && <span className="button-icon">{button.icon}</span>}
                  {button.label}
                </button>
              ))}
          </div>
        </div>
        <div className="content">{children}</div>
      </div>

      {isMobile && mobileSidebarOpen && <div className="sidebar-overlay" onClick={() => setMobileSidebarOpen(false)}></div>}
    </div>
  )
}
