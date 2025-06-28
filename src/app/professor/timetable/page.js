"use client"

import { useState, useEffect, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useLayout } from "../../../contexts/LayoutContext"
import LoadingSpinner from "../../../components/LoadingSpinner"
import styles from "../professor.module.css"

export default function ProfessorTimetablePage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const { setActionButtons } = useLayout()

  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
  const slots = [
    "09:00-10:00",
    "10:00-11:00",
    "11:00-12:00",
    "12:00-13:00",
    "14:00-15:00",
    "15:00-16:00",
    "16:00-17:00",
  ]

  useEffect(() => {
    // Set action buttons immediately
    setActionButtons([
      {
        label: "Back to Dashboard",
        icon: "←",
        onClick: () => {
          startTransition(() => {
            router.push("/professor")
          })
        },
        variant: "secondary",
      },
      {
        label: "Print Timetable",
        icon: "🖨️",
        onClick: handlePrint,
        variant: "secondary",
      },
      {
        label: "Refresh",
        icon: "🔄",
        onClick: fetchTimetable,
        variant: "secondary",
      },
    ])

    // Fetch timetable immediately
    fetchTimetable()

    return () => {
      setActionButtons([])
    }
  }, [])

  const fetchTimetable = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const res = await fetch("/api/timetable/professor")
      if (!res.ok) {
        throw new Error("Failed to fetch timetable")
      }
      
      const data = await res.json()
      setEntries(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const getEntry = (day, slot) =>
    entries.find((e) => e.day === day && e.timeSlot === slot)

  const getWeeklyStats = () => {
    const totalClasses = entries.length
    const uniqueDepartments = new Set(entries.map(e => e.department?.code)).size
    const totalHours = entries.length // Assuming each slot is 1 hour
    
    return { totalClasses, uniqueDepartments, totalHours }
  }

  const { totalClasses, uniqueDepartments, totalHours } = getWeeklyStats()

  return (
    <div className={styles.timetableContainer}>
      {error && <div className={styles.errorMessage}>{error}</div>}

      <div className={styles.timetableHeader}>
        <h2>My Weekly Timetable</h2>
        <p>Your complete teaching schedule for this week</p>
      </div>

      {loading ? (
        <div className={styles.loadingContainer}>
          <LoadingSpinner size="large" />
          <p>Loading your timetable...</p>
        </div>
      ) : (
        <>
          {/* Quick stats */}
          <div className={styles.quickStats}>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{totalClasses}</div>
              <div className={styles.statLabel}>Total Classes</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{uniqueDepartments}</div>
              <div className={styles.statLabel}>Unique Departments</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{totalHours}</div>
              <div className={styles.statLabel}>Weekly Hours</div>
            </div>
          </div>

          {entries.length === 0 ? (
            <div className={styles.emptyState}>
              <h3>No classes scheduled</h3>
              <p>You don&apos;t have any classes assigned to your timetable yet.</p>
            </div>
          ) : (
            <div className={styles.timetableWrapper}>
              <table className={styles.timetableGrid}>
                <thead>
                  <tr>
                    <th>Time</th>
                    {days.map((day) => (
                      <th key={day}>{day}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {slots.map((slot) => (
                    <tr key={slot}>
                      <td>
                        <strong>{slot}</strong>
                      </td>
                      {days.map((day) => {
                        const entry = getEntry(day, slot)
                        return (
                          <td
                            key={day + slot}
                            className={`${styles.timetableCell} ${
                              entry ? styles.hasEntry : styles.empty
                            }`}
                          >
                            {entry ? (
                              <div className={styles.departmentEntry}>
                                <div className={styles.departmentName}>
                                  {entry.department?.name || "Unknown Department"}
                                </div>
                                <div className={styles.departmentClassroom}>
                                  {entry.classroom || "TBA"}
                                </div>
                                {entry.batch && (
                                  <div className={styles.departmentProfessor}>
                                    Batch: {entry.batch.departmentName}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span style={{ color: "var(--text-secondary)" }}>Free</span>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}
