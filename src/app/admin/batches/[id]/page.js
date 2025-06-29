"use client"

import { useState, useEffect, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useLayout } from "../../../../contexts/LayoutContext"
import LoadingSpinner from "../../../../components/LoadingSpinner"
import Modal from "../../../../components/Modal"
import styles from "./batchDetail.module.css"

export default function BatchDetailPage({ params }) {
  const { id } = params
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const { setActionButtons } = useLayout()

  const [batch, setBatch] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  // New student form state
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [studentToDelete, setStudentToDelete] = useState(null)
  const [newStudent, setNewStudent] = useState({
    name: "",
    rollNo: "",
    email: "",
    password: "",
  })
  const [isAddingStudent, setIsAddingStudent] = useState(false)
  const [addStudentError, setAddStudentError] = useState(null)

  // Edit batch state
  const [editFormData, setEditFormData] = useState({
    departmentCode: "",
    startYear: new Date().getFullYear(),
    endYear: new Date().getFullYear() + 4,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [degrees, setDegrees] = useState([])
  const [departments, setDepartments] = useState([])
  const [selectedDegreeId, setSelectedDegreeId] = useState("")
  const [dataLoaded, setDataLoaded] = useState(false)

  useEffect(() => {
    // Set action buttons immediately
    setActionButtons([
      {
        label: "Add Student",
        icon: "👨‍🎓",
        onClick: () => setShowAddModal(true),
        variant: "primary",
      },
      {
        label: "Edit Batch",
        icon: "✏️",
        onClick: () => setShowEditModal(true),
        variant: "secondary",
      },
      {
        label: "Back to Batches",
        icon: "←",
        onClick: () => {
          startTransition(() => {
            router.push("/admin/batches")
          })
        },
        variant: "secondary",
      },
    ])

    // Fetch batch data immediately
    fetchBatchData()

    return () => {
      setActionButtons([])
    }
  }, [id, router, setActionButtons, fetchBatchData])

  const fetchBatchData = async () => {
    try {
      // Fetch batch details with students
      const batchRes = await fetch(`/api/admin/batches/${id}`)

      if (!batchRes.ok) {
        throw new Error("Failed to fetch batch details")
      }

      const batchData = await batchRes.json()
      setBatch(batchData.batch)

      // Set initial edit form data
      setEditFormData({
        departmentCode: batchData.batch.departmentCode,
        startYear: batchData.batch.startYear,
        endYear: batchData.batch.endYear,
      })

      // Set selected degree
      if (batchData.batch.department?.degree) {
        setSelectedDegreeId(batchData.batch.department.degree.code)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchDegreesForEdit = async () => {
    try {
      // Fetch all degrees for edit modal
      const degreesRes = await fetch("/api/degree")
      if (!degreesRes.ok) {
        throw new Error("Failed to fetch degrees")
      }
      const degreesData = await degreesRes.json()
      setDegrees(degreesData || [])

      // Find and set departments for the current degree
      if (selectedDegreeId) {
        const selectedDegree = degreesData.find((d) => d.code === selectedDegreeId)
        if (selectedDegree && selectedDegree.departments) {
          setDepartments(selectedDegree.departments)
        }
      }

      setDataLoaded(true)
    } catch (err) {
      setError(err.message)
    }
  }

  // Update departments when selected degree changes
  useEffect(() => {
    if (selectedDegreeId) {
      const selectedDegree = degrees.find((d) => d.code === selectedDegreeId)
      if (selectedDegree && selectedDegree.departments) {
        setDepartments(selectedDegree.departments)
      } else {
        setDepartments([])
      }
    } else {
      setDepartments([])
    }
  }, [selectedDegreeId, degrees])

  const handleAddStudentChange = (e) => {
    const { name, value } = e.target
    setNewStudent((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddStudent = async (e) => {
    if (e) e.preventDefault()

    if (!newStudent.name || !newStudent.rollNo || !newStudent.email || !newStudent.password) {
      setAddStudentError("All fields are required")
      return
    }

    setIsAddingStudent(true)
    setAddStudentError(null)

    try {
      const res = await fetch("/api/admin/batches/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newStudent,
          rollNo: parseInt(newStudent.rollNo),
          batchId: parseInt(id),
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to add student")
      }

      const { student } = await res.json()

      // Add the new student to the batch's students list
      setBatch((prev) => ({
        ...prev,
        students: [...prev.students, student],
      }))

      // Reset form
      setNewStudent({ name: "", rollNo: "", email: "", password: "" })
      setShowAddModal(false)
    } catch (err) {
      setAddStudentError(err.message)
    } finally {
      setIsAddingStudent(false)
    }
  }

  const handleDeleteStudent = async () => {
    if (!studentToDelete) return

    try {
      setGlobalLoading(true)
      const res = await fetch(`/api/admin/batches/students/${studentToDelete.id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        throw new Error("Failed to delete student")
      }

      // Remove the deleted student from state
      setBatch((prev) => ({
        ...prev,
        students: prev.students.filter((student) => student.id !== studentToDelete.id),
      }))
      setShowDeleteModal(false)
      setStudentToDelete(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setGlobalLoading(false)
    }
  }

  const handleEditChange = (e) => {
    const { name, value } = e.target

    if (name === "degreeId") {
      setSelectedDegreeId(value)
      setEditFormData((prev) => ({ ...prev, departmentCode: "" }))
    } else {
      setEditFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleEditBatch = async () => {
    if (!editFormData.departmentCode) {
      setError("Department code is required")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const res = await fetch(`/api/admin/batches/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editFormData,
          startYear: parseInt(editFormData.startYear),
          endYear: parseInt(editFormData.endYear),
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to update batch")
      }

      // Refresh batch data
      const batchRes = await fetch(`/api/admin/batches/${id}`)
      if (batchRes.ok) {
        const batchData = await batchRes.json()
        setBatch(batchData.batch)
      }

      setShowEditModal(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const openDeleteModal = (student) => {
    setStudentToDelete(student)
    setShowDeleteModal(true)
  }

  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i)

  return (
    <div className={styles.batchDetailContainer}>
      {error && <div className={styles.errorMessage}>{error}</div>}

      {loading ? (
        <div className={styles.loadingContainer}>
          <LoadingSpinner size="large" />
          <p>Loading batch details...</p>
        </div>
      ) : batch ? (
        <>
          <div className={styles.batchHeader}>
            <div className={styles.batchInfo}>
              <h2>{batch?.department?.degree?.name || "Unknown Degree"}</h2>
              <h3>{batch?.department?.name || "Unknown Department"}</h3>
              <div className={styles.batchMeta}>
                <span className={styles.batchYears}>
                  {batch?.startYear} - {batch?.endYear}
                </span>
                <span className={styles.studentCount}>{batch?.students?.length || 0} Students</span>
              </div>
              <div className={styles.batchCodes}>
                <span className={styles.degreeCode}>Degree: {batch?.department?.degree?.code || "Unknown"}</span>
                <span className={styles.departmentCode}>Department: {batch?.departmentCode || "Unknown"}</span>
              </div>
            </div>
          </div>

          <div className={styles.studentsSection}>
            <h3 className={styles.sectionTitle}>Enrolled Students</h3>

            {!batch?.students || batch.students.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No students enrolled in this batch yet.</p>
                <button className={styles.addButton} onClick={() => setShowAddModal(true)}>
                  Add First Student
                </button>
              </div>
            ) : (
              <div className={styles.tableContainer}>
                <table className={styles.studentsTable}>
                  <thead>
                    <tr>
                      <th>Roll No</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batch.students
                      .sort((a, b) => a.rollNo - b.rollNo)
                      .map((student) => (
                        <tr key={student.id}>
                          <td>{student.rollNo}</td>
                          <td>{student.user?.name}</td>
                          <td>{student.user?.email}</td>
                          <td className={styles.actionsCell}>
                            <button className={styles.deleteButton} onClick={() => openDeleteModal(student)}>
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

          {/* Add Student Modal */}
          <Modal
            isOpen={showAddModal}
            onClose={() => {
              setShowAddModal(false)
              setAddStudentError(null)
              setNewStudent({ name: "", rollNo: "", email: "", password: "" })
            }}
            title="Add New Student"
            size="medium"
            footerButtons={{
              cancel: {
                text: "Cancel",
                onClick: () => {
                  setShowAddModal(false)
                  setAddStudentError(null)
                  setNewStudent({ name: "", rollNo: "", email: "", password: "" })
                },
              },
              confirm: {
                text: isAddingStudent ? "Adding..." : "Add Student",
                onClick: handleAddStudent,
              },
            }}
          >
            {addStudentError && <div className={styles.errorMessage}>{addStudentError}</div>}

            <div className={styles.formGroup}>
              <label htmlFor="name">Student Name</label>
              <input type="text" id="name" name="name" value={newStudent.name} onChange={handleAddStudentChange} required className={styles.input} placeholder="Enter student's full name" />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="rollNo">Roll Number</label>
              <input type="number" id="rollNo" name="rollNo" value={newStudent.rollNo} onChange={handleAddStudentChange} required className={styles.input} placeholder="Enter roll number" />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email">Email Address</label>
              <input type="email" id="email" name="email" value={newStudent.email} onChange={handleAddStudentChange} required className={styles.input} placeholder="Enter student's email address" />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password">Password</label>
              <input type="password" id="password" name="password" value={newStudent.password} onChange={handleAddStudentChange} required className={styles.input} placeholder="Create a password" />
            </div>
          </Modal>

          {/* Delete Student Modal */}
          <Modal
            isOpen={showDeleteModal}
            onClose={() => {
              setShowDeleteModal(false)
              setStudentToDelete(null)
            }}
            title="Confirm Deletion"
            size="small"
            footerButtons={{
              cancel: {
                text: "Cancel",
                onClick: () => {
                  setShowDeleteModal(false)
                  setStudentToDelete(null)
                },
              },
              confirm: {
                text: "Delete Student",
                onClick: handleDeleteStudent,
              },
            }}
          >
            <p>
              Are you sure you want to delete student <strong>{studentToDelete?.user?.name}</strong> with roll number <strong>{studentToDelete?.rollNo}</strong>? This action cannot be undone.
            </p>
          </Modal>

          {/* Edit Batch Modal */}
          <Modal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false)
              // Reset form to current batch values
              setEditFormData({
                departmentCode: batch.departmentCode,
                startYear: batch.startYear,
                endYear: batch.endYear,
              })
              setSelectedDegreeId(batch.department?.degree?.code || "")
            }}
            title="Edit Batch"
            size="medium"
            footerButtons={{
              cancel: {
                text: "Cancel",
                onClick: () => {
                  setShowEditModal(false)
                  // Reset form to current batch values
                  setEditFormData({
                    departmentCode: batch.departmentCode,
                    startYear: batch.startYear,
                    endYear: batch.endYear,
                  })
                  setSelectedDegreeId(batch.department?.degree?.code || "")
                },
              },
              confirm: {
                text: isSubmitting ? "Saving..." : "Save Changes",
                onClick: handleEditBatch,
              },
            }}
          >
            {error && <div className={styles.errorMessage}>{error}</div>}

            <div className={styles.formGroup}>
              <label htmlFor="degreeId">Degree Program</label>
              <select id="degreeId" name="degreeId" value={selectedDegreeId} onChange={handleEditChange} required className={styles.select}>
                <option value="">Select Degree</option>
                {degrees.map((degree) => (
                  <option key={degree.code} value={degree.code}>
                    {degree.name} ({degree.code})
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="departmentCode">Department</label>
              <select id="departmentCode" name="departmentCode" value={editFormData.departmentCode} onChange={handleEditChange} required disabled={!selectedDegreeId || departments.length === 0} className={styles.select}>
                <option value="">Select Department</option>
                {departments.map((department) => (
                  <option key={department.code} value={department.code}>
                    {department.name} ({department.code})
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="startYear">Start Year</label>
                <select id="startYear" name="startYear" value={editFormData.startYear} onChange={handleEditChange} required className={styles.select}>
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="endYear">End Year</label>
                <select id="endYear" name="endYear" value={editFormData.endYear} onChange={handleEditChange} required className={styles.select}>
                  {yearOptions.map((year) => (
                    <option key={year} value={year} disabled={year < editFormData.startYear}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Modal>
        </>
      ) : (
        <div className={styles.emptyState}>
          <h3>Batch not found</h3>
          <p>The requested batch could not be loaded</p>
        </div>
      )}
    </div>
  )
}
