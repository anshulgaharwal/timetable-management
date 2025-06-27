"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAdmin } from "../../../contexts/AdminContext"
import LoadingSpinner from "../../../components/LoadingSpinner"
import Modal from "../../../components/Modal"
import styles from "./batches.module.css"

export default function AdminBatchesPage() {
  const [batches, setBatches] = useState([])
  const [error, setError] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [batchToDelete, setBatchToDelete] = useState(null)
  const [viewMode, setViewMode] = useState("grid") // grid or list
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [degrees, setDegrees] = useState([])
  const [courses, setCourses] = useState([])
  const [formData, setFormData] = useState({
    degreeId: "",
    courseCode: "",
    startYear: new Date().getFullYear(),
    endYear: new Date().getFullYear() + 4,
  })
  const router = useRouter()
  const { setActionButtons, setIsLoading: setGlobalLoading, isLoading } = useAdmin()

  useEffect(() => {
    // Set action buttons in the navbar
    setActionButtons([
      {
        label: "Create New Batch",
        onClick: () => setShowCreateModal(true),
      },
      {
        label: viewMode === "grid" ? "List View" : "Grid View",
        onClick: () => setViewMode(viewMode === "grid" ? "list" : "grid"),
      },
    ])

    // Fetch batches
    const fetchBatchesAndDegrees = async () => {
      try {
        setGlobalLoading(true)

        // Fetch batches
        const batchesRes = await fetch("/api/admin/batches")
        if (!batchesRes.ok) {
          throw new Error("Failed to fetch batches")
        }
        const batchesData = await batchesRes.json()
        setBatches(batchesData.batches || [])

        // Fetch degrees for create modal
        const degreesRes = await fetch("/api/degree")
        if (!degreesRes.ok) {
          throw new Error("Failed to fetch degrees")
        }
        const degreesData = await degreesRes.json()
        setDegrees(degreesData || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setGlobalLoading(false)
      }
    }

    fetchBatchesAndDegrees()

    // Clean up when component unmounts
    return () => {
      setActionButtons([])
      setGlobalLoading(false)
    }
  }, [setActionButtons, router, viewMode, setGlobalLoading])

  // Update courses when degree changes
  useEffect(() => {
    if (formData.degreeId) {
      const selectedDegree = degrees.find((d) => d.code === formData.degreeId)
      if (selectedDegree && selectedDegree.courses) {
        setCourses(selectedDegree.courses)
      } else {
        setCourses([])
      }
    } else {
      setCourses([])
    }
  }, [formData.degreeId, degrees])

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

  const handleDeleteBatch = async () => {
    if (!batchToDelete) return

    try {
      setGlobalLoading(true)
      const res = await fetch(`/api/admin/batches/${batchToDelete.id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        throw new Error("Failed to delete batch")
      }

      // Remove the deleted batch from state
      setBatches(batches.filter((batch) => batch.id !== batchToDelete.id))
      setShowDeleteModal(false)
      setBatchToDelete(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setGlobalLoading(false)
    }
  }

  const openDeleteModal = (batch) => {
    setBatchToDelete(batch)
    setShowDeleteModal(true)
  }

  const navigateToBatch = (batchId) => {
    setGlobalLoading(true)
    router.push(`/admin/batches/${batchId}`)
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target

    setFormData((prev) => {
      // If changing degree, reset course
      if (name === "degreeId") {
        return { ...prev, [name]: value, courseCode: "" }
      }

      // If changing startYear, update endYear based on typical program duration
      if (name === "startYear") {
        const startYearNum = parseInt(value)
        let duration = 4 // default to 4 years

        // Set duration based on degree type
        const selectedDegree = degrees.find((d) => d.code === formData.degreeId)
        if (selectedDegree) {
          const degreeName = selectedDegree.name.toLowerCase()
          if (degreeName.includes("bachelor") || degreeName.includes("btech")) duration = 4
          else if (degreeName.includes("master") || degreeName.includes("mtech") || degreeName.includes("msc")) duration = 2
          else if (degreeName.includes("phd") || degreeName.includes("doctor")) duration = 5
        }

        return {
          ...prev,
          [name]: value,
          endYear: startYearNum + duration,
        }
      }

      return { ...prev, [name]: value }
    })
  }

  const handleCreateBatch = async () => {
    setIsSubmitting(true)
    setError(null)
    setGlobalLoading(true)

    try {
      const res = await fetch("/api/admin/batches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          startYear: parseInt(formData.startYear),
          endYear: parseInt(formData.endYear),
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to create batch")
      }

      const { batch } = await res.json()

      // Refresh batches list
      const batchesRes = await fetch("/api/admin/batches")
      if (batchesRes.ok) {
        const data = await batchesRes.json()
        setBatches(data.batches || [])
      }

      // Reset form and close modal
      setFormData({
        degreeId: "",
        courseCode: "",
        startYear: new Date().getFullYear(),
        endYear: new Date().getFullYear() + 4,
      })
      setShowCreateModal(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
      setGlobalLoading(false)
    }
  }

  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i)

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner size="large" />
        <p>Loading batches...</p>
      </div>
    )
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
          <button className={styles.createButton} onClick={() => setShowCreateModal(true)}>
            Create Batch
          </button>
        </div>
      ) : (
        <>
          <div className={styles.batchesHeader}>
            <h2>All Batches</h2>
            <p>Manage student batches across all programs</p>
          </div>

          {Object.values(batchesByDegree).map((degree) => (
            <div key={degree.code} className={styles.degreeSection}>
              <h3 className={styles.degreeTitle}>
                {degree.name} ({degree.code})
              </h3>

              {viewMode === "grid" ? (
                <div className={styles.batchGrid}>
                  {degree.batches.map((batch) => (
                    <div key={batch.id} className={styles.batchCard}>
                      <div className={styles.batchCardHeader}>
                        <h4>{batch.courseName}</h4>
                        <span className={styles.batchYears}>
                          {batch.startYear} - {batch.endYear}
                        </span>
                      </div>
                      <div className={styles.batchCardBody}>
                        <div className={styles.batchStat}>
                          <span className={styles.statLabel}>Students</span>
                          <span className={styles.statValue}>{batch.studentCount || 0}</span>
                        </div>
                        <div className={styles.courseCode}>{batch.courseCode}</div>
                        <div className={styles.batchCardActions}>
                          <button className={styles.viewButton} onClick={() => navigateToBatch(batch.id)}>
                            View Details
                          </button>
                          <button
                            className={styles.deleteButton}
                            onClick={(e) => {
                              e.stopPropagation()
                              openDeleteModal(batch)
                            }}
                          >
                            Delete
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
                          <td>{batch.courseName}</td>
                          <td>{batch.courseCode}</td>
                          <td>
                            {batch.startYear} - {batch.endYear}
                          </td>
                          <td>{batch.studentCount || 0}</td>
                          <td className={styles.tableActions}>
                            <button className={styles.viewButton} onClick={() => navigateToBatch(batch.id)}>
                              View
                            </button>
                            <button className={styles.deleteButton} onClick={() => openDeleteModal(batch)}>
                              Delete
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

      {/* Delete Batch Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setBatchToDelete(null)
        }}
        title="Confirm Deletion"
        size="small"
        footerButtons={{
          cancel: {
            text: "Cancel",
            onClick: () => {
              setShowDeleteModal(false)
              setBatchToDelete(null)
            },
          },
          confirm: {
            text: "Delete Batch",
            onClick: handleDeleteBatch,
          },
        }}
      >
        <p>
          Are you sure you want to delete batch <strong>{batchToDelete?.courseName}</strong>? This action cannot be undone and will remove all associated data.
        </p>
      </Modal>

      {/* Create Batch Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false)
          setFormData({
            degreeId: "",
            courseCode: "",
            startYear: new Date().getFullYear(),
            endYear: new Date().getFullYear() + 4,
          })
          setError(null)
        }}
        title="Create New Batch"
        size="medium"
        footerButtons={{
          cancel: {
            text: "Cancel",
            onClick: () => {
              setShowCreateModal(false)
              setFormData({
                degreeId: "",
                courseCode: "",
                startYear: new Date().getFullYear(),
                endYear: new Date().getFullYear() + 4,
              })
              setError(null)
            },
          },
          confirm: {
            text: isSubmitting ? "Creating..." : "Create Batch",
            onClick: handleCreateBatch,
          },
        }}
      >
        {error && <div className={styles.errorMessage}>{error}</div>}

        <div className={styles.formGroup}>
          <label htmlFor="degreeId">Degree Program</label>
          <select id="degreeId" name="degreeId" value={formData.degreeId} onChange={handleFormChange} required className={styles.select}>
            <option value="">Select Degree</option>
            {degrees.map((degree) => (
              <option key={degree.code} value={degree.code}>
                {degree.name} ({degree.code})
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="courseCode">Course</label>
          <select id="courseCode" name="courseCode" value={formData.courseCode} onChange={handleFormChange} required disabled={!formData.degreeId || courses.length === 0} className={styles.select}>
            <option value="">Select Course</option>
            {courses.map((course) => (
              <option key={course.code} value={course.code}>
                {course.name} ({course.code})
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="startYear">Start Year</label>
            <select id="startYear" name="startYear" value={formData.startYear} onChange={handleFormChange} required className={styles.select}>
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="endYear">End Year</label>
            <select id="endYear" name="endYear" value={formData.endYear} onChange={handleFormChange} required className={styles.select}>
              {yearOptions.map((year) => (
                <option key={year} value={year} disabled={year < formData.startYear}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Modal>
    </div>
  )
}
