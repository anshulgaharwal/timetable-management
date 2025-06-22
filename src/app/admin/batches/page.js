"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAdmin } from "../../../contexts/AdminContext"
import styles from "./batches.module.css"

export default function AdminBatchesPage() {
  const [batches, setBatches] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const router = useRouter()
  const { setActionButtons } = useAdmin()

  useEffect(() => {
    // Set action buttons in the navbar
    setActionButtons([
      {
        label: "Create New Batch",
        onClick: () => router.push("/admin/batches/create"),
      }
    ])

    // Fetch batches
    const fetchBatches = async () => {
      try {
        setIsLoading(true)
        const res = await fetch("/api/admin/batches")
        
        if (!res.ok) {
          throw new Error("Failed to fetch batches")
        }
        
        const data = await res.json()
        setBatches(data.batches || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBatches()

    // Clean up when component unmounts
    return () => setActionButtons([])
  }, [setActionButtons, router])

  // Group batches by degree for better organization
  const batchesByDegree = batches.reduce((acc, batch) => {
    if (!acc[batch.degree]) {
      acc[batch.degree] = []
    }
    acc[batch.degree].push(batch)
    return acc
  }, {})

  if (isLoading) {
    return <div className={styles.loadingContainer}>Loading batches...</div>
  }

  if (error) {
    return <div className={styles.errorContainer}>Error: {error}</div>
  }

  return (
    <div className={styles.batchesContainer}>
      {Object.keys(batchesByDegree).length === 0 ? (
        <div className={styles.emptyState}>
          <h3>No batches found</h3>
          <p>Create your first batch to get started</p>
          <button 
            className={styles.createButton}
            onClick={() => router.push("/admin/batches/create")}
          >
            Create Batch
          </button>
        </div>
      ) : (
        <>
          <div className={styles.batchesHeader}>
            <h2>All Batches</h2>
            <p>Manage student batches across all programs</p>
          </div>
          
          {Object.entries(batchesByDegree).map(([degree, degreeBatches]) => (
            <div key={degree} className={styles.degreeSection}>
              <h3 className={styles.degreeTitle}>{degree}</h3>
              <div className={styles.batchGrid}>
                {degreeBatches.map((batch) => (
                  <div key={batch.id} className={styles.batchCard} onClick={() => router.push(`/admin/batches/${batch.id}`)}>
                    <div className={styles.batchCardHeader}>
                      <h4>{batch.course}</h4>
                      <span className={styles.batchYears}>{batch.startYear} - {batch.endYear}</span>
                    </div>
                    <div className={styles.batchCardBody}>
                      <div className={styles.batchStat}>
                        <span className={styles.statLabel}>Students</span>
                        <span className={styles.statValue}>{batch.studentCount || 0}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  )
} 