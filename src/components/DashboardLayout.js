"use client"
import { useSession, signOut } from "next-auth/react"
import { usePathname, useRouter } from "next/navigation"
import "../styles/dashboard.css"
import Link from "next/link"
import { useAdmin } from "../contexts/AdminContext"
import { useState, useEffect, useTransition } from "react"
import LoadingSpinner from "./LoadingSpinner"

export default function DashboardLayout({ children, sidebarTabs, pageTitle, actionButtons: propsActionButtons }) {
  const { data: session } = useSession()
  const path = usePathname()
  const router = useRouter()
  const [isMobile, setIsMobile] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [activeTab, setActiveTab] = useState("")

  // Get loading state from context
  const { actionButtons: contextButtons, setActionButtons, isLoading, setIsLoading } = useAdmin()

  // Then check if we have action buttons from context or props
  const actionButtons = contextButtons || propsActionButtons || []

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkScreenSize()
    window.addEventListener("resize", checkScreenSize)

    // Set active tab based on current path
    setActiveTab(path)

    // Clear loading state when path changes (navigation completes)
    setIsLoading(false)

    return () => window.removeEventListener("resize", checkScreenSize)
  }, [path, setIsLoading])

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push("/")
  }

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen((prev) => !prev)
  }

  const handleNavigation = (href) => {
    if (href === path) return

    // Set loading state immediately
    setIsLoading(true)
    setActiveTab(href)

    // Use startTransition to indicate to React this is a non-urgent update
    startTransition(() => {
      router.push(href)
    })

    // Close mobile sidebar if open
    if (isMobile) {
      setMobileSidebarOpen(false)
    }

    // Set a safety timeout to clear loading state in case the navigation takes too long
    setTimeout(() => {
      setIsLoading(false)
    }, 3000)
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
              <a
                key={index}
                href={tab.href}
                className={activeTab === tab.href ? "active" : ""}
                onClick={(e) => {
                  e.preventDefault()
                  handleNavigation(tab.href)
                }}
              >
                {tab.icon && <span className="tab-icon">{tab.icon}</span>}
                <span>{tab.label}</span>
              </a>
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
          <div className="page-title">
            {pageTitle || "Dashboard"}
            {isPending && (
              <span className="loading-indicator">
                <LoadingSpinner size="small" />
              </span>
            )}
          </div>
          <div className="action-buttons">
            {actionButtons &&
              actionButtons.map((button, index) => (
                <button key={index} onClick={button.onClick} className={button.className || ""} disabled={button.disabled || isPending}>
                  {button.icon && <span className="button-icon">{button.icon}</span>}
                  {button.label}
                </button>
              ))}
          </div>
        </div>
        <div className="content">
          {isLoading && <LoadingSpinner fullPage={true} size="large" />}
          {children}
        </div>
      </div>

      {isMobile && mobileSidebarOpen && <div className="sidebar-overlay" onClick={() => setMobileSidebarOpen(false)}></div>}
    </div>
  )
}
