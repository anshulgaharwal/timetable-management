"use client"

import { useState, useEffect, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useLayout } from "../../../contexts/LayoutContext"
import LoadingSpinner from "../../../components/LoadingSpinner"
import Modal from "../../../components/Modal"
import styles from "./degrees.module.css"

export default function DegreesPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const { setActionButtons } = useLayout()

  const [degrees, setDegrees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [formData, setFormData] = useState({ name: "", code: "" })
  const [selectedDegree, setSelectedDegree] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [viewMode, setViewMode] = useState("grid") // grid or list

  useEffect(() => {
    // Set action buttons immediately
    setActionButtons([
      {
        label: "Create Degree",
        icon: "➕",
        onClick: () => {
          setFormData({ name: "", code: "" })
          setShowCreateModal(true)
          setError(null)
        },
        variant: "primary",
      },
      {
        label: viewMode === "grid" ? "List View" : "Grid View",
        icon: viewMode === "grid" ? "📋" : "⊞",
        onClick: () => setViewMode(viewMode === "grid" ? "list" : "grid"),
        variant: "secondary",
      },
    ])

    // Fetch degrees immediately
    fetchDegrees()

    return () => {
      setActionButtons([])
    }
  }, [viewMode])

  const fetchDegrees = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/degree")
      if (!response.ok) {
        throw new Error("Failed to fetch degrees")
      }
      const data = await response.json()
      setDegrees(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCreateDegree = async () => {
    if (!formData.name || !formData.code) {
      setError("Please fill in all fields")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const res = await fetch("/api/degree", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to create degree")
      }

      // Refresh degrees list
      await fetchDegrees()

      // Reset form and close modal
      setFormData({ name: "", code: "" })
      setShowCreateModal(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditDegree = async () => {
    if (!formData.name || !formData.code) {
      setError("Please fill in all fields")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const res = await fetch("/api/degree", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedDegree.code, ...formData }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to update degree")
      }

      // Refresh degrees list
      await fetchDegrees()

      // Reset form and close modal
      setFormData({ name: "", code: "" })
      setSelectedDegree(null)
      setShowEditModal(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteDegree = async () => {
    if (!selectedDegree) return

    setIsSubmitting(true)
    setError(null)

    try {
      const res = await fetch("/api/degree", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedDegree.code }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to delete degree")
      }

      // Refresh degrees list
      await fetchDegrees()

      // Reset state and close modal
      setSelectedDegree(null)
      setShowDeleteModal(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEditModal = (degree) => {
    setSelectedDegree(degree)
    setFormData({ name: degree.name, code: degree.code })
    setShowEditModal(true)
    setError(null)
  }

  const openDeleteModal = (degree) => {
    setSelectedDegree(degree)
    setShowDeleteModal(true)
    setError(null)
  }

  const viewDegreeDetails = (degree) => {
    startTransition(() => {
      router.push(`/admin/degrees/${degree.code}`)
    })
  }
  return (
    <div className={styles.degreesContainer}>
      {error && <div className={styles.errorMessage}>{error}</div>}

      {loading ? (
        <div className={styles.loadingContainer}>
          <LoadingSpinner size="large" />
          <p>Loading degrees...</p>
        </div>
      ) : degrees.length === 0 ? (
        <div className={styles.emptyState}>
          <h3>No degrees found</h3>
          <p>Create your first degree program to get started</p>
          <button className={styles.createButton} onClick={() => setShowCreateModal(true)}>
            Create Degree
          </button>
        </div>
      ) : (
        <>
          <div className={styles.degreesHeader}>
            <h2>Degree Programs</h2>
            <p>Manage academic degree programs and their courses</p>
          </div>

          {viewMode === "grid" ? (
            <div className={styles.degreeGrid}>
              {degrees.map((degree) => (
                <div key={degree.code} className={styles.degreeCard} onClick={() => viewDegreeDetails(degree)}>
                  <div className={styles.degreeCardHeader}>
                    <h4>{degree.name}</h4>
                    <span className={styles.degreeCode}>{degree.code}</span>
                  </div>
                  <div className={styles.degreeCardBody}>
                    <div className={styles.degreeStat}>
                      <span className={styles.statLabel}>Courses</span>
                      <span className={styles.statValue}>{degree.courses?.length || 0}</span>
                    </div>
                    <div className={styles.degreeCardActions}>
                      <button
                        className={styles.editButton}
                        onClick={(e) => {
                          e.stopPropagation()
                          openEditModal(degree)
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className={styles.deleteButton}
                        onClick={(e) => {
                          e.stopPropagation()
                          openDeleteModal(degree)
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
            <div className={styles.degreeTable}>
              <table>
                <thead>
                  <tr>
                    <th>Degree Name</th>
                    <th>Code</th>
                    <th>Courses</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {degrees.map((degree) => (
                    <tr key={degree.code}>
                      <td>{degree.name}</td>
                      <td>{degree.code}</td>
                      <td>{degree.courses?.length || 0}</td>
                      <td className={styles.tableActions}>
                        <button className={styles.viewButton} onClick={() => viewDegreeDetails(degree)}>
                          View
                        </button>
                        <button className={styles.editButton} onClick={() => openEditModal(degree)}>
                          Edit
                        </button>
                        <button className={styles.deleteButton} onClick={() => openDeleteModal(degree)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Create Degree Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false)
          setFormData({ name: "", code: "" })
          setError(null)
        }}
        title="Create New Degree"
        size="medium"
        footerButtons={{
          cancel: {
            text: "Cancel",
            onClick: () => {
              setShowCreateModal(false)
              setFormData({ name: "", code: "" })
              setError(null)
            },
          },
          confirm: {
            text: isSubmitting ? "Creating..." : "Create Degree",
            onClick: handleCreateDegree,
            disabled: isSubmitting || !formData.name || !formData.code,
          },
        }}
      >
        {error && <div className={styles.errorMessage}>{error}</div>}

        <div className={styles.formGroup}>
          <label htmlFor="code">Degree Code</label>
          <input
            type="text"
            id="code"
            name="code"
            value={formData.code}
            onChange={handleFormChange}
            required
            placeholder="e.g., BTECH, MTECH, PhD"
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="name">Degree Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleFormChange}
            required
            placeholder="e.g., Bachelor of Technology"
            className={styles.input}
          />
        </div>
      </Modal>

      {/* Edit Degree Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setFormData({ name: "", code: "" })
          setSelectedDegree(null)
          setError(null)
        }}
        title="Edit Degree"
        size="medium"
        footerButtons={{
          cancel: {
            text: "Cancel",
            onClick: () => {
              setShowEditModal(false)
              setFormData({ name: "", code: "" })
              setSelectedDegree(null)
              setError(null)
            },
          },
          confirm: {
            text: isSubmitting ? "Saving..." : "Save Changes",
            onClick: handleEditDegree,
            disabled: isSubmitting || !formData.name || !formData.code,
          },
        }}
      >
        {error && <div className={styles.errorMessage}>{error}</div>}

        <div className={styles.formGroup}>
          <label htmlFor="editCode">Degree Code</label>
          <input
            type="text"
            id="editCode"
            name="code"
            value={formData.code}
            onChange={handleFormChange}
            required
            disabled
            className={styles.input}
          />
          <small className={styles.helpText}>Degree code cannot be changed</small>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="editName">Degree Name</label>
          <input
            type="text"
            id="editName"
            name="name"
            value={formData.name}
            onChange={handleFormChange}
            required
            placeholder="e.g., Bachelor of Technology"
            className={styles.input}
          />
        </div>
      </Modal>

      {/* Delete Degree Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setSelectedDegree(null)
          setError(null)
        }}
        title="Confirm Deletion"
        size="small"
        footerButtons={{
          cancel: {
            text: "Cancel",
            onClick: () => {
              setShowDeleteModal(false)
              setSelectedDegree(null)
              setError(null)
            },
          },
          confirm: {
            text: isSubmitting ? "Deleting..." : "Delete Degree",
            onClick: handleDeleteDegree,
            disabled: isSubmitting,
            variant: "danger",
          },
        }}
      >
        {error && <div className={styles.errorMessage}>{error}</div>}

        <p>
          Are you sure you want to delete the degree program <strong>{selectedDegree?.name}</strong>? This action cannot be undone and will also delete all associated courses.
        </p>
      </Modal>
    </div>
  )
}
