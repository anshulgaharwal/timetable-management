"use client"

import { useState, useEffect, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useLayout } from "../../contexts/LayoutContext"
import LoadingSpinner from "../../components/LoadingSpinner"
import styles from "./student.module.css"

export default function StudentDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const { setActionButtons } = useLayout()

  const [stats, setStats] = useState({
    totalDepartments: 0,
    currentSemester: 0,
    completedAssignments: 0,
    upcomingExams: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Protect route from unauthorized roles
  useEffect(() => {
    if (status === "authenticated") {
      if (!session) return
      if (session.user.role.toLowerCase() !== "student") {
        router.replace("/unauthorized")
        return
      }
    } else if (status === "unauthenticated") {
      router.replace("/signin")
      return
    }
  }, [status, session, router])

  useEffect(() => {
    if (status !== "authenticated" || !session) return

    // Set action buttons immediately
    setActionButtons([
      {
        label: "View Timetable",
        icon: "📅",
        onClick: () => {
          startTransition(() => {
            router.push("/student/timetable")
          })
        },
        variant: "primary",
      },
    ])

    // Fetch student stats
    fetchStats()

    return () => {
      setActionButtons([])
    }
  }, [status, session])

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch student statistics (this would need to be implemented in the API)
      // For now, we'll use mock data
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
      setStats({
        totalDepartments: 6,
        currentSemester: 4,
        completedAssignments: 12,
        upcomingExams: 3,
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
      description: "View your weekly class schedule",
      icon: "📅",
      href: "/student/timetable",
    },
    {
      title: "Available Polls",
      description: "View and participate in polls",
      icon: "🗳️",
      href: "/student/polls",
    },
    {
      title: "Poll Results",
      description: "View poll results and statistics",
      icon: "📊",
      href: "/result",
    },
  ]

  const navigateTo = (href) => {
    startTransition(() => {
      router.push(href)
    })
  }

  // Show loading while session is being checked or during redirect
  if (status === "loading" || !session) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner size="large" />
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className={styles.studentContainer}>
      {error && <div className={styles.errorMessage}>{error}</div>}

      <div className={styles.welcomeSection}>
        <h1 className={styles.welcomeTitle}>
          Welcome back, {session?.user?.name || 'Student'}!
        </h1>
        <p className={styles.welcomeSubtitle}>
          Here&apos;s your student dashboard overview
        </p>

        {loading ? (
          <div className={styles.loadingContainer}>
            <LoadingSpinner size="medium" />
            <p>Loading your dashboard...</p>
          </div>
        ) : (
          <div className={styles.quickStats}>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{stats.totalDepartments}</div>
              <div className={styles.statLabel}>Total Departments</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{stats.currentSemester}</div>
              <div className={styles.statLabel}>Current Semester</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{stats.completedAssignments}</div>
              <div className={styles.statLabel}>Assignments Done</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{stats.upcomingExams}</div>
              <div className={styles.statLabel}>Upcoming Exams</div>
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
