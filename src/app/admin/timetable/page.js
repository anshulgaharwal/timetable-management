"use client"

import { useState, useEffect, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useLayout } from "../../../contexts/LayoutContext"
import LoadingSpinner from "../../../components/LoadingSpinner"
import styles from "./timetable.module.css"

export default function AdminTimetablePage() {
  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [viewMode, setViewMode] = useState("grid") // grid or list
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const { setActionButtons } = useLayout()

  useEffect(() => {
    // Set action buttons immediately
    setActionButtons([
      {
        label: viewMode === "grid" ? "List View" : "Grid View",
        icon: viewMode === "grid" ? "📋" : "⊞",
        onClick: () => setViewMode(viewMode === "grid" ? "list" : "grid"),
        variant: "secondary",
      },
      {
        label: "Refresh",
        icon: "🔄",
        onClick: fetchBatches,
        variant: "secondary",
      },
    ])

    // Fetch batches immediately
    fetchBatches()

    return () => {
      setActionButtons([])
    }
  }, [viewMode])

  const fetchBatches = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch("/api/admin/batches")
      if (!res.ok) {
        throw new Error("Failed to fetch batches")
      }
      const data = await res.json()
      setBatches(data.batches || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const navigateToTimetable = (batchId) => {
    startTransition(() => {
      router.push(`/admin/timetable/${batchId}`)
    })
  }

  // Group batches by degree for better organization
  const batchesByDegree = batches.reduce((acc, batch) => {
    const degreeCode = batch.degreeCode || "Unknown"
    if (!acc[degreeCode]) {
      acc[degreeCode] = {
        code: degreeCode,
        name: batch.degreeName || "Unknown Degree",
        batches: [],
      }
    }
    acc[degreeCode].batches.push(batch)
    return acc
  }, {})

  return (
    <div className={styles.timetableContainer}>
      {error && <div className={styles.errorMessage}>{error}</div>}

      {loading ? (
        <div className={styles.loadingContainer}>
          <LoadingSpinner size="large" />
          <p>Loading batches...</p>
        </div>
      ) : Object.keys(batchesByDegree).length === 0 ? (
        <div className={styles.emptyState}>
          <h3>No batches found</h3>
          <p>Create batches first to manage their timetables</p>
          <button 
            className={styles.createButton} 
            onClick={() => router.push("/admin/batches")}
          >
            Manage Batches
          </button>
        </div>
      ) : (
        <>
          <div className={styles.timetableHeader}>
            <h2>Timetable Management</h2>
            <p>Manage timetables for all student batches</p>
          </div>

          {Object.values(batchesByDegree).map((degree) => (
            <div key={degree.code} className={styles.degreeSection}>
              <h3 className={styles.degreeTitle}>
                {degree.name} ({degree.code})
              </h3>

              {viewMode === "grid" ? (
                <div className={styles.batchGrid}>
                  {degree.batches.map((batch) => (
                    <div 
                      key={batch.id} 
                      className={styles.batchCard}
                      onClick={() => navigateToTimetable(batch.id)}
                    >
                      <div className={styles.batchCardHeader}>
                        <h4>{batch.courseName}</h4>
                        <span className={styles.batchId}>#{batch.id}</span>
                      </div>
                      <div className={styles.batchCardBody}>
                        <div className={styles.batchInfo}>
                          <div className={styles.batchDetail}>
                            <strong>Course:</strong> {batch.courseCode}
                          </div>
                        </div>
                        <div className={styles.batchInfo}>
                          <div className={styles.batchDetail}>
                            <strong>Years:</strong> {batch.startYear} - {batch.endYear}
                          </div>
                        </div>
                        <div className={styles.batchStats}>
                          <div className={styles.batchStat}>
                            <span className={styles.statLabel}>Students</span>
                            <span className={styles.statValue}>{batch.studentCount || 0}</span>
                          </div>
                        </div>
                        <div className={styles.batchCardActions}>
                          <button 
                            className={styles.viewButton}
                            onClick={(e) => {
                              e.stopPropagation()
                              navigateToTimetable(batch.id)
                            }}
                          >
                            Manage Timetable
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.batchTable}>
                  <table>
                    <thead>
                      <tr>
                        <th>Batch ID</th>
                        <th>Course Name</th>
                        <th>Course Code</th>
                        <th>Years</th>
                        <th>Students</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {degree.batches.map((batch) => (
                        <tr key={batch.id}>
                          <td>#{batch.id}</td>
                          <td>{batch.courseName}</td>
                          <td>{batch.courseCode}</td>
                          <td>{batch.startYear} - {batch.endYear}</td>
                          <td>{batch.studentCount || 0}</td>
                          <td className={styles.tableActions}>
                            <button 
                              className={styles.viewButton}
                              onClick={() => navigateToTimetable(batch.id)}
                            >
                              Manage
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  )
}
