"use client"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useAdmin } from "../../contexts/AdminContext"
import styles from "./admin.module.css"

export default function AdminPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { setActionButtons } = useAdmin()
  const [stats, setStats] = useState({
    batches: 0,
    students: 0,
    polls: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setActionButtons([
      {
        label: "Create Poll",
        onClick: () => router.push("/create"),
      },
      {
        label: "Create Batch",
        onClick: () => router.push("/admin/batches/create"),
      }
    ])

    // Fetch some basic stats
    const fetchStats = async () => {
      try {
        setIsLoading(true)
        const batchesRes = await fetch("/api/batches")
        
        if (batchesRes.ok) {
          const batchesData = await batchesRes.json()
          const batches = batchesData.batches || []
          
          // Calculate total students across all batches
          const totalStudents = batches.reduce((sum, batch) => sum + (batch.studentCount || 0), 0)
          
          setStats(prev => ({
            ...prev,
            batches: batches.length,
            students: totalStudents
          }))
        }
        
        // You could add more stats here like polls count, etc.
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchStats()

    // Clean up when unmounting
    return () => setActionButtons([])
  }, [setActionButtons, router])

  const adminFeatures = [
    {
      title: "Batch Management",
      description: "Create and manage student batches",
      icon: "👥",
      action: () => router.push("/admin/batches")
    },
    {
      title: "Poll Management",
      description: "Create and manage polls",
      icon: "📊",
      action: () => router.push("/admin/polls")
    },
    {
      title: "Professor Management",
      description: "Manage professor accounts",
      icon: "👨‍🏫",
      action: () => router.push("/admin/professors")
    }
  ]

  return (
    <div className={styles.adminDashboard}>
      <div className={styles.welcomeSection}>
        <h1>Welcome, {session?.user?.name || "Administrator"}!</h1>
        <p>Manage your timetable management system</p>
      </div>

      <div className={styles.statsSection}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{isLoading ? "..." : stats.batches}</div>
          <div className={styles.statLabel}>Batches</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{isLoading ? "..." : stats.students}</div>
          <div className={styles.statLabel}>Students</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{isLoading ? "..." : stats.polls}</div>
          <div className={styles.statLabel}>Active Polls</div>
        </div>
      </div>

      <h2 className={styles.sectionTitle}>Quick Actions</h2>
      <div className={styles.featuresGrid}>
        {adminFeatures.map((feature, index) => (
          <div key={index} className={styles.featureCard} onClick={feature.action}>
            <div className={styles.featureIcon}>{feature.icon}</div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
