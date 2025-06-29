"use client"

import { useState, useEffect, useTransition } from "react"
import { useParams, useRouter } from "next/navigation"
import { useLayout } from "../../../../contexts/LayoutContext"
import LoadingSpinner from "../../../../components/LoadingSpinner"
import Modal from "../../../../components/Modal"
import styles from "../degrees.module.css"

export default function DegreeDepartmentsPage() {
  const params = useParams()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const { setActionButtons } = useLayout()
  const degreeCode = params.code

  const [degree, setDegree] = useState(null)
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [departmentFormData, setDepartmentFormData] = useState({ name: "", code: "" })
  const [selectedDepartment, setSelectedDepartment] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [viewMode, setViewMode] = useState("grid") // grid or list

  useEffect(() => {
    // Set action buttons immediately
    setActionButtons([
      {
        label: "Add Department",
        icon: "➕",
        onClick: () => {
          setDepartmentFormData({ name: "", code: "" })
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
      {
        label: "Back to Degrees",
        icon: "←",
        onClick: () => {
          startTransition(() => {
            router.push("/admin/degrees")
          })
        },
        variant: "secondary",
      },
    ])

    // Fetch degree data immediately
    fetchDegree()

    return () => {
      setActionButtons([])
    }
  }, [degreeCode, viewMode, fetchDegree, router, setActionButtons])

  const fetchDegree = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/degree")
      if (!response.ok) {
        throw new Error("Failed to fetch degrees")
      }
      const data = await response.json()
      const foundDegree = data.find((d) => d.code === degreeCode)

      if (foundDegree) {
        setDegree(foundDegree)
        setDepartments(foundDegree.departments || [])
      } else {
        setError("Degree not found")
        // Redirect to degrees list after a short delay
        setTimeout(() => {
          startTransition(() => {
            router.push("/admin/degrees")
          })
        }, 2000)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDepartmentFormChange = (e) => {
    const { name, value } = e.target
    setDepartmentFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCreateDepartment = async () => {
    if (!departmentFormData.name || !departmentFormData.code) {
      setError("Please fill in all fields")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const res = await fetch("/api/department", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...departmentFormData,
          degreeId: degreeCode,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to create department")
      }

      // Refresh degree data
      await fetchDegree()

      // Reset form and close modal
      setDepartmentFormData({ name: "", code: "" })
      setShowCreateModal(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditDepartment = async () => {
    if (!departmentFormData.name || !departmentFormData.code) {
      setError("Please fill in all fields")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const res = await fetch("/api/department", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedDepartment.code,
          ...departmentFormData,
          degreeId: degreeCode,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to update department")
      }

      // Refresh degree data
      await fetchDegree()

      // Reset form and close modal
      setDepartmentFormData({ name: "", code: "" })
      setSelectedDepartment(null)
      setShowEditModal(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteDepartment = async () => {
    if (!selectedDepartment) return

    setIsSubmitting(true)
    setError(null)

    try {
      const res = await fetch("/api/department", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedDepartment.code }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to delete department")
      }

      // Refresh degree data
      await fetchDegree()

      // Reset state and close modal
      setSelectedDepartment(null)
      setShowDeleteModal(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEditModal = (department) => {
    setSelectedDepartment(department)
    setDepartmentFormData({ name: department.name, code: department.code })
    setShowEditModal(true)
    setError(null)
  }

  const openDeleteModal = (department) => {
    setSelectedDepartment(department)
    setShowDeleteModal(true)
    setError(null)
  }
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner size="large" />
        <p>Loading degree information...</p>
      </div>
    )
  }

  if (!degree) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorMessage}>{error || "Degree not found"}</div>
        <button className={styles.backButton} onClick={() => router.push("/admin/degrees")}>
          Back to Degrees
        </button>
      </div>
    )
  }

  return (
    <div className={styles.degreesContainer}>
      {error && <div className={styles.errorMessage}>{error}</div>}

      <div className={styles.degreesHeader}>
        <h2>
          {degree.name} ({degree.code}) - Departments
        </h2>
        <p>Manage departments for this degree program</p>
      </div>

      {departments.length === 0 ? (
        <div className={styles.emptyState}>
          <h3>No departments found</h3>
          <p>Add departments to this degree program to get started</p>
          <button className={styles.createButton} onClick={() => setShowCreateModal(true)}>
            Add Department
          </button>
        </div>
      ) : (
        <>
          {viewMode === "grid" ? (
            <div className={styles.degreeGrid}>
              {departments.map((department) => (
                <div key={department.code} className={styles.degreeCard}>
                  <div className={styles.degreeCardHeader}>
                    <h4>{department.name}</h4>
                    <span className={styles.degreeCode}>{department.code}</span>
                  </div>
                  <div className={styles.degreeCardBody}>
                    <div className={styles.degreeCardActions}>
                      <button className={styles.editButton} onClick={() => openEditModal(department)}>
                        Edit
                      </button>
                      <button className={styles.deleteButton} onClick={() => openDeleteModal(department)}>
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
                    <th>Department Name</th>
                    <th>Department Code</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {departments.map((department) => (
                    <tr key={department.code}>
                      <td>{department.name}</td>
                      <td>{department.code}</td>
                      <td className={styles.tableActions}>
                        <button className={styles.editButton} onClick={() => openEditModal(department)}>
                          Edit
                        </button>
                        <button className={styles.deleteButton} onClick={() => openDeleteModal(department)}>
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

      {/* Create Department Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false)
          setDepartmentFormData({ name: "", code: "" })
          setError(null)
        }}
        title="Add New Department"
        size="medium"
        footerButtons={{
          cancel: {
            text: "Cancel",
            onClick: () => {
              setShowCreateModal(false)
              setDepartmentFormData({ name: "", code: "" })
              setError(null)
            },
          },
          confirm: {
            text: isSubmitting ? "Adding..." : "Add Department",
            onClick: handleCreateDepartment,
            disabled: isSubmitting || !departmentFormData.name || !departmentFormData.code,
          },
        }}
      >
        {error && <div className={styles.errorMessage}>{error}</div>}

        <div className={styles.formGroup}>
          <label htmlFor="departmentCode">Department Code</label>
          <input type="text" id="departmentCode" name="code" value={departmentFormData.code} onChange={handleDepartmentFormChange} required placeholder="e.g., CSE, ME, EE" className={styles.input} />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="departmentName">Department Name</label>
          <input type="text" id="departmentName" name="name" value={departmentFormData.name} onChange={handleDepartmentFormChange} required placeholder="e.g., Computer Science and Engineering" className={styles.input} />
        </div>
      </Modal>

      {/* Edit Department Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setDepartmentFormData({ name: "", code: "" })
          setSelectedDepartment(null)
          setError(null)
        }}
        title="Edit Department"
        size="medium"
        footerButtons={{
          cancel: {
            text: "Cancel",
            onClick: () => {
              setShowEditModal(false)
              setDepartmentFormData({ name: "", code: "" })
              setSelectedDepartment(null)
              setError(null)
            },
          },
          confirm: {
            text: isSubmitting ? "Saving..." : "Save Changes",
            onClick: handleEditDepartment,
            disabled: isSubmitting || !departmentFormData.name || !departmentFormData.code,
          },
        }}
      >
        {error && <div className={styles.errorMessage}>{error}</div>}

        <div className={styles.formGroup}>
          <label htmlFor="editDepartmentCode">Department Code</label>
          <input type="text" id="editDepartmentCode" name="code" value={departmentFormData.code} onChange={handleDepartmentFormChange} required disabled className={styles.input} />
          <small className={styles.helpText}>Department code cannot be changed</small>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="editDepartmentName">Department Name</label>
          <input type="text" id="editDepartmentName" name="name" value={departmentFormData.name} onChange={handleDepartmentFormChange} required placeholder="e.g., Computer Science and Engineering" className={styles.input} />
        </div>
      </Modal>

      {/* Delete Department Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setSelectedDepartment(null)
          setError(null)
        }}
        title="Confirm Deletion"
        size="small"
        footerButtons={{
          cancel: {
            text: "Cancel",
            onClick: () => {
              setShowDeleteModal(false)
              setSelectedDepartment(null)
              setError(null)
            },
          },
          confirm: {
            text: isSubmitting ? "Deleting..." : "Delete Department",
            onClick: handleDeleteDepartment,
            disabled: isSubmitting,
            variant: "danger",
          },
        }}
      >
        {error && <div className={styles.errorMessage}>{error}</div>}

        <p>
          Are you sure you want to delete the department <strong>{selectedDepartment?.name}</strong>? This action cannot be undone and may affect related data.
        </p>
      </Modal>
    </div>
  )
}
