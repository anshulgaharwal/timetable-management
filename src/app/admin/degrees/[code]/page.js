"use client"

import { useState, useEffect, useTransition } from "react"
import { useParams, useRouter } from "next/navigation"
import { useLayout } from "../../../../contexts/LayoutContext"
import LoadingSpinner from "../../../../components/LoadingSpinner"
import Modal from "../../../../components/Modal"
import styles from "../degrees.module.css"

export default function DegreeCoursesPage() {
  const params = useParams()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const { setActionButtons } = useLayout()
  const degreeCode = params.code

  const [degree, setDegree] = useState(null)
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [courseFormData, setCourseFormData] = useState({ name: "", code: "" })
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [viewMode, setViewMode] = useState("grid") // grid or list

  useEffect(() => {
    // Set action buttons immediately
    setActionButtons([
      {
        label: "Add Course",
        icon: "➕",
        onClick: () => {
          setCourseFormData({ name: "", code: "" })
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
  }, [degreeCode, viewMode])

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
        setCourses(foundDegree.courses || [])
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

  const handleCourseFormChange = (e) => {
    const { name, value } = e.target
    setCourseFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCreateCourse = async () => {
    if (!courseFormData.name || !courseFormData.code) {
      setError("Please fill in all fields")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const res = await fetch("/api/course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...courseFormData,
          degreeId: degreeCode,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to create course")
      }

      // Refresh degree data
      await fetchDegree()

      // Reset form and close modal
      setCourseFormData({ name: "", code: "" })
      setShowCreateModal(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditCourse = async () => {
    if (!courseFormData.name || !courseFormData.code) {
      setError("Please fill in all fields")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const res = await fetch("/api/course", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedCourse.code,
          ...courseFormData,
          degreeId: degreeCode,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to update course")
      }

      // Refresh degree data
      await fetchDegree()

      // Reset form and close modal
      setCourseFormData({ name: "", code: "" })
      setSelectedCourse(null)
      setShowEditModal(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteCourse = async () => {
    if (!selectedCourse) return

    setIsSubmitting(true)
    setError(null)

    try {
      const res = await fetch("/api/course", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedCourse.code }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to delete course")
      }

      // Refresh degree data
      await fetchDegree()

      // Reset state and close modal
      setSelectedCourse(null)
      setShowDeleteModal(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEditModal = (course) => {
    setSelectedCourse(course)
    setCourseFormData({ name: course.name, code: course.code })
    setShowEditModal(true)
    setError(null)
  }

  const openDeleteModal = (course) => {
    setSelectedCourse(course)
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
        <div className={styles.errorMessage}>
          {error || "Degree not found"}
        </div>
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
          {degree.name} ({degree.code}) - Courses
        </h2>
        <p>Manage courses for this degree program</p>
      </div>

      {courses.length === 0 ? (
        <div className={styles.emptyState}>
          <h3>No courses found</h3>
          <p>Add courses to this degree program to get started</p>
          <button className={styles.createButton} onClick={() => setShowCreateModal(true)}>
            Add Course
          </button>
        </div>
      ) : (
        <>
          {viewMode === "grid" ? (
            <div className={styles.degreeGrid}>
              {courses.map((course) => (
                <div key={course.code} className={styles.degreeCard}>
                  <div className={styles.degreeCardHeader}>
                    <h4>{course.name}</h4>
                    <span className={styles.degreeCode}>{course.code}</span>
                  </div>
                  <div className={styles.degreeCardBody}>
                    <div className={styles.degreeCardActions}>
                      <button
                        className={styles.editButton}
                        onClick={() => openEditModal(course)}
                      >
                        Edit
                      </button>
                      <button
                        className={styles.deleteButton}
                        onClick={() => openDeleteModal(course)}
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
                    <th>Course Name</th>
                    <th>Course Code</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => (
                    <tr key={course.code}>
                      <td>{course.name}</td>
                      <td>{course.code}</td>
                      <td className={styles.tableActions}>
                        <button className={styles.editButton} onClick={() => openEditModal(course)}>
                          Edit
                        </button>
                        <button className={styles.deleteButton} onClick={() => openDeleteModal(course)}>
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

      {/* Create Course Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false)
          setCourseFormData({ name: "", code: "" })
          setError(null)
        }}
        title="Add New Course"
        size="medium"
        footerButtons={{
          cancel: {
            text: "Cancel",
            onClick: () => {
              setShowCreateModal(false)
              setCourseFormData({ name: "", code: "" })
              setError(null)
            },
          },
          confirm: {
            text: isSubmitting ? "Adding..." : "Add Course",
            onClick: handleCreateCourse,
            disabled: isSubmitting || !courseFormData.name || !courseFormData.code,
          },
        }}
      >
        {error && <div className={styles.errorMessage}>{error}</div>}

        <div className={styles.formGroup}>
          <label htmlFor="courseCode">Course Code</label>
          <input
            type="text"
            id="courseCode"
            name="code"
            value={courseFormData.code}
            onChange={handleCourseFormChange}
            required
            placeholder="e.g., CS101, MATH201"
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="courseName">Course Name</label>
          <input
            type="text"
            id="courseName"
            name="name"
            value={courseFormData.name}
            onChange={handleCourseFormChange}
            required
            placeholder="e.g., Introduction to Computer Science"
            className={styles.input}
          />
        </div>
      </Modal>

      {/* Edit Course Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setCourseFormData({ name: "", code: "" })
          setSelectedCourse(null)
          setError(null)
        }}
        title="Edit Course"
        size="medium"
        footerButtons={{
          cancel: {
            text: "Cancel",
            onClick: () => {
              setShowEditModal(false)
              setCourseFormData({ name: "", code: "" })
              setSelectedCourse(null)
              setError(null)
            },
          },
          confirm: {
            text: isSubmitting ? "Saving..." : "Save Changes",
            onClick: handleEditCourse,
            disabled: isSubmitting || !courseFormData.name || !courseFormData.code,
          },
        }}
      >
        {error && <div className={styles.errorMessage}>{error}</div>}

        <div className={styles.formGroup}>
          <label htmlFor="editCourseCode">Course Code</label>
          <input
            type="text"
            id="editCourseCode"
            name="code"
            value={courseFormData.code}
            onChange={handleCourseFormChange}
            required
            disabled
            className={styles.input}
          />
          <small className={styles.helpText}>Course code cannot be changed</small>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="editCourseName">Course Name</label>
          <input
            type="text"
            id="editCourseName"
            name="name"
            value={courseFormData.name}
            onChange={handleCourseFormChange}
            required
            placeholder="e.g., Introduction to Computer Science"
            className={styles.input}
          />
        </div>
      </Modal>

      {/* Delete Course Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setSelectedCourse(null)
          setError(null)
        }}
        title="Confirm Deletion"
        size="small"
        footerButtons={{
          cancel: {
            text: "Cancel",
            onClick: () => {
              setShowDeleteModal(false)
              setSelectedCourse(null)
              setError(null)
            },
          },
          confirm: {
            text: isSubmitting ? "Deleting..." : "Delete Course",
            onClick: handleDeleteCourse,
            disabled: isSubmitting,
            variant: "danger",
          },
        }}
      >
        {error && <div className={styles.errorMessage}>{error}</div>}

        <p>
          Are you sure you want to delete the course <strong>{selectedCourse?.name}</strong>? This action cannot be undone and may affect related data.
        </p>
      </Modal>
    </div>
  )
}
