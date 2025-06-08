"use client"
import { useSession, signOut } from "next-auth/react"
import { usePathname } from "next/navigation"
import "../styles/dashboard.css"

export default function DashboardLayout({ children, sidebarTabs }) {
  const { data: session } = useSession()
  const path = usePathname()

  return (
    <>
      <aside className="sidebar">
        {sidebarTabs &&
          sidebarTabs.map((tab, index) => (
            <a key={index} href={tab.href} className={path === tab.href ? "active" : ""}>
              {tab.label}
            </a>
          ))}
      </aside>
      <main className="main">
        <header className="navbar">
          <div className="logo">🎓 MyApp</div>
          <div className="user-info">
            <span>
              {session?.user?.name} ({session?.user?.role})
            </span>
            <button onClick={() => signOut()}>Logout</button>
          </div>
        </header>
        <div className="content">{children}</div>
      </main>
    </>
  )
}
