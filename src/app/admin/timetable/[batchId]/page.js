"use client"

import { useState, useEffect, useTransition } from "react"
import { useParams, useRouter } from "next/navigation"
import { useLayout } from "../../../../contexts/LayoutContext"
import LoadingSpinner from "../../../../components/LoadingSpinner"
import Modal from "../../../../components/Modal"
import html2pdf from "html2pdf.js"
import styles from "../timetable.module.css"

export default function BatchTimetablePage() {
  const { batchId } = useParams()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const { setActionButtons } = useLayout()

  const [entries, setEntries] = useState([])
  const [professors, setProfessors] = useState([])
  const [batchInfo, setBatchInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editData, setEditData] = useState({
    course: "",
    professorId: "",
    classroom: "",
  })

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
  const slots = ["09:00-10:00", "10:00-11:00", "11:00-12:00", "12:00-13:00", "14:00-15:00", "15:00-16:00", "16:00-17:00"]

  useEffect(() => {
    // Set action buttons immediately
    setActionButtons([
      {
        label: "Back to Timetables",
        icon: "←",
        onClick: () => {
          startTransition(() => {
            router.push("/admin/timetable")
          })
        },
        variant: "secondary",
      },
      {
        label: "Export PDF",
        icon: "📄",
        onClick: handleExportPDF,
        variant: "primary",
      },
      {
        label: "Refresh",
        icon: "🔄",
        onClick: fetchTimetableData,
        variant: "secondary",
      },
    ])

    // Fetch data immediately
    fetchTimetableData()
    fetchFormData()

    return () => {
      setActionButtons([])
    }
  }, [batchId])

  const fetchTimetableData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch timetable entries
      const entriesRes = await fetch(`/api/timetable/batch/${batchId}`)
      if (!entriesRes.ok) {
        throw new Error("Failed to fetch timetable data")
      }
      const entriesData = await entriesRes.json()
      setEntries(entriesData || [])

      // Fetch batch info
      const batchRes = await fetch(`/api/admin/batches/${batchId}`)
      if (batchRes.ok) {
        const batchData = await batchRes.json()
        setBatchInfo(batchData.batch)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchFormData = async () => {
    try {
      const res = await fetch("/api/form-data")
      if (!res.ok) {
        throw new Error("Failed to fetch form data")
      }
      const data = await res.json()
      setProfessors(data.professors || [])
    } catch (err) {
      console.error("Error fetching form data:", err)
    }
  }

  const getEntry = (day, slot) => entries.find((e) => e.day === day && e.timeSlot === slot)

  const handleCellClick = (day, timeSlot) => {
    const existing = getEntry(day, timeSlot)
    setEditData({
      course: existing?.course || "",
      professorId: existing?.professorId || "",
      classroom: existing?.classroom || "",
    })
    setSelectedSlot({ day, timeSlot })
    setError(null)
  }

  const handleExportPDF = () => {
    const element = document.getElementById("timetable-grid")
    if (!element) return

    const opt = {
      filename: `Batch-${batchId}-Timetable.pdf`,
      margin: [0.5, 0.5],
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "landscape" },
    }

    html2pdf().set(opt).from(element).save()
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setEditData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    if (!editData.course.trim() || !editData.professorId || !editData.classroom.trim()) {
      setError("Please fill in all fields")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const res = await fetch("/api/timetable/upsert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...selectedSlot,
          ...editData,
          batchId: parseInt(batchId),
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to save timetable entry")
      }

      const newEntry = await res.json()

      setEntries((prev) => {
        const others = prev.filter((e) => !(e.day === newEntry.day && e.timeSlot === newEntry.timeSlot))
        return [...others, newEntry]
      })

      setSelectedSlot(null)
      setEditData({ course: "", professorId: "", classroom: "" })
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedSlot) return

    setIsDeleting(true)
    setError(null)

    try {
      const res = await fetch("/api/timetable/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          day: selectedSlot.day,
          timeSlot: selectedSlot.timeSlot,
          batchId: parseInt(batchId),
        }),
      })

      if (!res.ok) {
        throw new Error("Failed to delete timetable entry")
      }

      setEntries((prev) => prev.filter((e) => !(e.day === selectedSlot.day && e.timeSlot === selectedSlot.timeSlot)))

      setShowDeleteModal(false)
      setSelectedSlot(null)
      setEditData({ course: "", professorId: "", classroom: "" })
    } catch (err) {
      setError(err.message)
    } finally {
      setIsDeleting(false)
    }
  }

  const closeModal = () => {
    setSelectedSlot(null)
    setEditData({ course: "", professorId: "", classroom: "" })
    setShowDeleteModal(false)
    setError(null)
  }

  return (
    <div className={styles.timetableDetailContainer}>
      {error && <div className={styles.errorMessage}>{error}</div>}

      {loading ? (
        <div className={styles.loadingContainer}>
          <LoadingSpinner size="large" />
          <p>Loading timetable...</p>
        </div>
      ) : (
        <>
          <div className={styles.timetableHeader}>
            <h2>Timetable - {batchInfo ? `${batchInfo.departmentName} (${batchInfo.departmentCode})` : `Batch ${batchId}`}</h2>
            <p>{batchInfo && `${batchInfo.startYear} - ${batchInfo.endYear} • ${batchInfo.studentCount || 0} students`}</p>
          </div>

          <div className={styles.timetableWrapper}>
            <table id="timetable-grid" className={styles.timetableGrid}>
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
                        <td key={day + slot} className={`${styles.timetableCell} ${entry ? styles.filled : styles.empty}`} onClick={() => handleCellClick(day, slot)}>
                          {entry ? (
                            <div className={styles.departmentEntry}>
                              <div className={styles.departmentName}>{entry.course}</div>
                              <div className={styles.departmentClassroom}>{entry.classroom}</div>
                              <div className={styles.departmentProfessor}>{entry.professor.name}</div>
                            </div>
                          ) : (
                            "Click to add"
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Edit Slot Modal */}
      <Modal
        isOpen={selectedSlot && !showDeleteModal}
        onClose={closeModal}
        title={`Edit Slot: ${selectedSlot?.day}, ${selectedSlot?.timeSlot}`}
        size="medium"
        footerButtons={{
          cancel: {
            text: "Cancel",
            onClick: closeModal,
          },
          confirm: {
            text: isSubmitting ? "Saving..." : "Save",
            onClick: handleSave,
            disabled: isSubmitting,
          },
          delete: {
            text: "Delete Entry",
            onClick: () => setShowDeleteModal(true),
            variant: "danger",
            show: getEntry(selectedSlot?.day, selectedSlot?.timeSlot),
          },
        }}
      >
        {error && <div className={styles.errorMessage}>{error}</div>}

        <div className={styles.formGroup}>
          <label htmlFor="course">Course</label>
          <input id="course" name="course" type="text" value={editData.course} onChange={handleFormChange} placeholder="Enter course name (e.g., Mathematics, Physics)" required className={styles.input} />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="professorId">Professor</label>
          <select id="professorId" name="professorId" value={editData.professorId} onChange={handleFormChange} required className={styles.select}>
            <option value="">Select Professor</option>
            {professors.map((professor) => (
              <option key={professor.id} value={professor.id}>
                {professor.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="classroom">Classroom</label>
          <input id="classroom" name="classroom" type="text" value={editData.classroom} onChange={handleFormChange} placeholder="Enter classroom (e.g., Room 101)" required className={styles.input} />
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Deletion"
        size="small"
        footerButtons={{
          cancel: {
            text: "Cancel",
            onClick: () => setShowDeleteModal(false),
          },
          confirm: {
            text: isDeleting ? "Deleting..." : "Delete Entry",
            onClick: handleDelete,
            disabled: isDeleting,
            variant: "danger",
          },
        }}
      >
        <p>Are you sure you want to delete this timetable entry? This action cannot be undone.</p>
      </Modal>
    </div>
  )
}
