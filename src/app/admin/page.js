"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState, useTransition } from "react"
import { useLayout } from "../../contexts/LayoutContext"
import styles from "./admin.module.css"
import LoadingSpinner from "../../components/LoadingSpinner"

export default function AdminPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { setActionButtons } = useLayout()
  const [stats, setStats] = useState({
    batches: 0,
    students: 0,
    polls: 0,
  })
  const [statsLoading, setStatsLoading] = useState(true)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    // Set action buttons immediately
    setActionButtons([
      {
        label: "Create Poll",
        icon: "📊",
        onClick: () => handleNavigation("/admin/polls/create"),
        variant: "primary",
      },
      {
        label: "Create Batch",
        icon: "👥",
        onClick: () => handleNavigation("/admin/batches/create"),
        variant: "secondary",
      },
    ])

    // Fetch stats asynchronously without blocking UI
    const fetchStats = async () => {
      try {
        const batchesRes = await fetch("/api/admin/batches")

        if (batchesRes.ok) {
          const batchesData = await batchesRes.json()
          const batches = batchesData.batches || []
          const totalStudents = batches.reduce((sum, batch) => sum + (batch.studentCount || 0), 0)

          setStats({
            batches: batches.length,
            students: totalStudents,
            polls: 0, // Add polls count when API is available
          })
        }
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setStatsLoading(false)
      }
    }

    fetchStats()

    // Cleanup
    return () => {
      setActionButtons([])
    }
  }, [setActionButtons])

  const handleNavigation = (path) => {
    startTransition(() => {
      router.push(path)
    })
  }

  const adminFeatures = [
    {
      title: "Batch Management",
      description: "Create and manage student batches",
      icon: "👥",
      path: "/admin/batches",
    },
    {
      title: "Poll Management",
      description: "Create and manage polls",
      icon: "📊",
      path: "/admin/polls",
    },
    {
      title: "Professor Management",
      description: "Manage professor accounts",
      icon: "👨‍🏫",
      path: "/admin/professors",
    },
    {
      title: "Degree Management",
      description: "Manage academic degrees and departments",
      icon: "🎓",
      path: "/admin/degrees",
    },
    {
      title: "Timetable Management",
      description: "View and manage timetables",
      icon: "📅",
      path: "/admin/timetable",
    },
    {
      title: "Settings",
      description: "System configuration and settings",
      icon: "⚙️",
      path: "/admin/settings",
    },
  ]

  return (
    <div className={styles.adminDashboard}>
      {/* Welcome section renders immediately */}
      <div className={styles.welcomeSection}>
        <h1>Welcome, {session?.user?.name || "Administrator"}!</h1>
        <p>Manage your timetable management system from this dashboard</p>
      </div>

      {/* Stats section with individual loading indicators */}
      <div className={styles.statsSection}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{statsLoading ? <LoadingSpinner size="small" /> : stats.batches}</div>
          <div className={styles.statLabel}>Total Batches</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{statsLoading ? <LoadingSpinner size="small" /> : stats.students}</div>
          <div className={styles.statLabel}>Total Students</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{statsLoading ? <LoadingSpinner size="small" /> : stats.polls}</div>
          <div className={styles.statLabel}>Active Polls</div>
        </div>
      </div>

      {/* Features grid renders immediately */}
      <h2 className={styles.sectionTitle}>Admin Features</h2>
      <div className={styles.featuresGrid}>
        {adminFeatures.map((feature, index) => (
          <div key={index} className={styles.featureCard} onClick={() => handleNavigation(feature.path)}>
            <div className={styles.featureIcon}>{feature.icon}</div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
