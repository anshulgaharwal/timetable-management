"use client"

import { useState, useEffect, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useLayout } from "../../contexts/LayoutContext"
import LoadingSpinner from "../../components/LoadingSpinner"
import styles from "./professor.module.css"

export default function ProfessorPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const { setActionButtons } = useLayout()

  const [stats, setStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    activePolls: 0,
    weeklyHours: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Set action buttons immediately
    setActionButtons([
      {
        label: "View Timetable",
        icon: "📅",
        onClick: () => {
          startTransition(() => {
            router.push("/professor/timetable")
          })
        },
        variant: "primary",
      },
    ])

    // Fetch professor stats
    fetchStats()

    return () => {
      setActionButtons([])
    }
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch professor statistics (this would need to be implemented in the API)
      // For now, we'll use mock data
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
      setStats({
        totalClasses: 5,
        totalStudents: 120,
        activePolls: 2,
        weeklyHours: 18,
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const quickActions = [
    {
      title: "My Timetable",
      description: "View your weekly teaching schedule",
      icon: "📅",
      href: "/professor/timetable",
    },
  ]

  const navigateTo = (href) => {
    startTransition(() => {
      router.push(href)
    })
  }

  return (
    <div className={styles.professorContainer}>
      {error && <div className={styles.errorMessage}>{error}</div>}

      <div className={styles.welcomeSection}>
        <h1 className={styles.welcomeTitle}>
          Welcome back, {session?.user?.name || 'Professor'}!
        </h1>
        <p className={styles.welcomeSubtitle}>
          Here's your teaching dashboard overview
        </p>

        {loading ? (
          <div className={styles.loadingContainer}>
            <LoadingSpinner size="medium" />
            <p>Loading your dashboard...</p>
          </div>
        ) : (
          <div className={styles.quickStats}>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{stats.totalClasses}</div>
              <div className={styles.statLabel}>Total Classes</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{stats.totalStudents}</div>
              <div className={styles.statLabel}>Total Students</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{stats.activePolls}</div>
              <div className={styles.statLabel}>Active Polls</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{stats.weeklyHours}</div>
              <div className={styles.statLabel}>Weekly Hours</div>
            </div>
          </div>
        )}
      </div>

      <div className={styles.featureGrid}>
        {quickActions.map((action, index) => (
          <div
            key={index}
            className={styles.featureCard}
            onClick={() => navigateTo(action.href)}
          >
            <span className={styles.featureIcon}>{action.icon}</span>
            <h3 className={styles.featureTitle}>{action.title}</h3>
            <p className={styles.featureDescription}>{action.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
