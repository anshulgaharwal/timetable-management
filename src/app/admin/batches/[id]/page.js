"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAdmin } from "../../../../contexts/AdminContext"
import styles from "./batchDetail.module.css"

export default function BatchDetailPage({ params }) {
  const { id } = params
  const router = useRouter()
  const { setActionButtons } = useAdmin()

  const [batch, setBatch] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // New student form state
  const [showAddForm, setShowAddForm] = useState(false)
  const [newStudent, setNewStudent] = useState({
    name: "",
    rollNo: "",
  })
  const [isAddingStudent, setIsAddingStudent] = useState(false)
  const [addStudentError, setAddStudentError] = useState(null)

  useEffect(() => {
    // Set action buttons in the navbar
    setActionButtons([
      {
        label: "Add Student",
        onClick: () => setShowAddForm(true),
      },
      {
        label: "Edit Batch",
        onClick: () => router.push(`/admin/batches/${id}/edit`),
      },
      {
        label: "Back to Batches",
        onClick: () => router.push("/admin/batches"),
      },
    ])

    // Fetch batch data
    const fetchBatchData = async () => {
      try {
        setIsLoading(true)

        // Fetch batch details with students
        const batchRes = await fetch(`/api/admin/batches/${id}`)

        if (!batchRes.ok) {
          throw new Error("Failed to fetch batch details")
        }

        const batchData = await batchRes.json()
        setBatch(batchData.batch)
      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBatchData()

    // Clean up when component unmounts
    return () => setActionButtons([])
  }, [id, setActionButtons, router])

  const handleAddStudentChange = (e) => {
    const { name, value } = e.target
    setNewStudent((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddStudent = async (e) => {
    e.preventDefault()
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
      setNewStudent({ name: "", rollNo: "" })
      setShowAddForm(false)
    } catch (err) {
      setAddStudentError(err.message)
    } finally {
      setIsAddingStudent(false)
    }
  }

  if (isLoading) {
    return <div className={styles.loadingContainer}>Loading batch details...</div>
  }

  if (error) {
    return <div className={styles.errorContainer}>Error: {error}</div>
  }

  return (
    <div className={styles.batchDetailContainer}>
      <div className={styles.batchHeader}>
        <div className={styles.batchInfo}>
          <h2>{batch?.course?.degree?.name || "Unknown Degree"}</h2>
          <h3>{batch?.course?.name || "Unknown Course"}</h3>
          <div className={styles.batchMeta}>
            <span className={styles.batchYears}>
              {batch?.startYear} - {batch?.endYear}
            </span>
            <span className={styles.studentCount}>{batch?.students?.length || 0} Students</span>
          </div>
          <div className={styles.batchCodes}>
            <span className={styles.degreeCode}>Degree: {batch?.course?.degree?.code || "Unknown"}</span>
            <span className={styles.courseCode}>Course: {batch?.courseCode || "Unknown"}</span>
          </div>
        </div>
      </div>

      {showAddForm && (
        <div className={styles.addStudentSection}>
          <div className={styles.addStudentCard}>
            <div className={styles.addStudentHeader}>
              <h3>Add New Student</h3>
              <button
                className={styles.closeButton}
                onClick={() => {
                  setShowAddForm(false)
                  setAddStudentError(null)
                }}
              >
                ×
              </button>
            </div>

            {addStudentError && <div className={styles.errorMessage}>{addStudentError}</div>}

            <form onSubmit={handleAddStudent} className={styles.addStudentForm}>
              <div className={styles.formGroup}>
                <label htmlFor="name">Student Name</label>
                <input type="text" id="name" name="name" value={newStudent.name} onChange={handleAddStudentChange} required className={styles.input} placeholder="Enter student's full name" />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="rollNo">Roll Number</label>
                <input type="number" id="rollNo" name="rollNo" value={newStudent.rollNo} onChange={handleAddStudentChange} required className={styles.input} placeholder="Enter roll number" />
              </div>

              <div className={styles.formActions}>
                <button type="button" onClick={() => setShowAddForm(false)} className={styles.cancelButton} disabled={isAddingStudent}>
                  Cancel
                </button>
                <button type="submit" className={styles.submitButton} disabled={isAddingStudent}>
                  {isAddingStudent ? "Adding..." : "Add Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className={styles.studentsSection}>
        <h3 className={styles.sectionTitle}>Enrolled Students</h3>

        {!batch?.students || batch.students.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No students enrolled in this batch yet.</p>
            <button className={styles.addButton} onClick={() => setShowAddForm(true)}>
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
                </tr>
              </thead>
              <tbody>
                {batch.students
                  .sort((a, b) => a.rollNo - b.rollNo)
                  .map((student) => (
                    <tr key={student.id}>
                      <td>{student.rollNo}</td>
                      <td>{student.name}</td>
                      <td>{student.email}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
