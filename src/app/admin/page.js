"use client"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState, useTransition } from "react"
import { useAdmin } from "../../contexts/AdminContext"
import styles from "./admin.module.css"
import LoadingSpinner from "../../components/LoadingSpinner"

export default function AdminPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { setActionButtons, setIsLoading } = useAdmin()
  const [stats, setStats] = useState({
    batches: 0,
    students: 0,
    polls: 0,
  })
  const [statsLoading, setStatsLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [loadingSection, setLoadingSection] = useState(null)

  useEffect(() => {
    // Clear any global loading state when component mounts
    setIsLoading(false)

    setActionButtons([
      {
        label: "Create Poll",
        onClick: () => router.push("/create"),
      },
      {
        label: "Create Batch",
        onClick: () => router.push("/admin/batches/create"),
      },
    ])

    // Fetch some basic stats
    const fetchStats = async () => {
      try {
        setStatsLoading(true)
        const batchesRes = await fetch("/api/batches")

        if (batchesRes.ok) {
          const batchesData = await batchesRes.json()
          const batches = batchesData.batches || []

          // Calculate total students across all batches
          const totalStudents = batches.reduce((sum, batch) => sum + (batch.studentCount || 0), 0)

          setStats((prev) => ({
            ...prev,
            batches: batches.length,
            students: totalStudents,
          }))
        }

        // You could add more stats here like polls count, etc.
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setStatsLoading(false)
      }
    }

    fetchStats()

    // Clean up when unmounting
    return () => {
      setActionButtons([])
      setLoadingSection(null) // Clear loading section on unmount
    }
  }, [setActionButtons, router, setIsLoading])

  const handleNavigation = (path) => {
    // Set loading section to indicate which section is being loaded
    setLoadingSection(path)

    // Set global loading state
    setIsLoading(true)

    // Use startTransition to indicate to React this is a non-urgent update
    startTransition(() => {
      router.push(path)
    })

    // Set a safety timeout to clear loading state in case the navigation takes too long
    setTimeout(() => {
      setLoadingSection(null)
    }, 3000)
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
  ]

  return (
    <div className={styles.adminDashboard}>
      <div className={styles.welcomeSection}>
        <h1>Welcome, {session?.user?.name || "Administrator"}!</h1>
        <p>Manage your timetable management system</p>
      </div>

      <div className={styles.statsSection}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{statsLoading ? <LoadingSpinner size="small" /> : stats.batches}</div>
          <div className={styles.statLabel}>Batches</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{statsLoading ? <LoadingSpinner size="small" /> : stats.students}</div>
          <div className={styles.statLabel}>Students</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{statsLoading ? <LoadingSpinner size="small" /> : stats.polls}</div>
          <div className={styles.statLabel}>Active Polls</div>
        </div>
      </div>

      <h2 className={styles.sectionTitle}>Quick Actions</h2>
      <div className={styles.featuresGrid}>
        {adminFeatures.map((feature, index) => (
          <div key={index} className={`${styles.featureCard} ${loadingSection === feature.path ? styles.loading : ""}`} onClick={() => handleNavigation(feature.path)}>
            {loadingSection === feature.path && (
              <div className={styles.featureCardLoading}>
                <LoadingSpinner size="medium" />
              </div>
            )}
            <div className={styles.featureIcon}>{feature.icon}</div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
