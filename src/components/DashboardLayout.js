"use client"
import { useSession, signOut } from "next-auth/react"
import { usePathname, useRouter } from "next/navigation"
import "../styles/dashboard.css"
import Link from "next/link"
import { useAdmin } from "../contexts/AdminContext"

export default function DashboardLayout({ children, sidebarTabs, pageTitle, actionButtons: propsActionButtons }) {
  const { data: session } = useSession()
  const path = usePathname()
  const router = useRouter()
  // Try to get action buttons from context, fall back to props
  const adminContext = useAdmin ? useAdmin() : null
  const actionButtons = adminContext?.actionButtons || propsActionButtons || []

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push("/")
  }

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <div className="sidebar-logo">
          <span>TMS</span>
        </div>

        <div className="sidebar-tabs">
          {sidebarTabs &&
            sidebarTabs.map((tab, index) => (
              <Link key={index} href={tab.href} className={path === tab.href ? "active" : ""}>
                {tab.label}
              </Link>
            ))}
        </div>

        <div className="sidebar-user">
          <span className="user-name">{session?.user?.name}</span>
          <span className="user-role">{session?.user?.role}</span>
          <button onClick={handleSignOut}>Sign out</button>
        </div>
      </div>

      <div className="main">
        <div className="navbar">
          <div className="page-title">{pageTitle || "Dashboard"}</div>
          <div className="action-buttons">
            {actionButtons &&
              actionButtons.map((button, index) => (
                <button key={index} onClick={button.onClick} className={button.className || ""}>
                  {button.label}
                </button>
              ))}
          </div>
        </div>
        <div className="content">{children}</div>
      </div>
    </div>
  )
}
