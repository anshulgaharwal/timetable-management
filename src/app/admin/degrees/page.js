"use client"
import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useAdmin } from "../../../contexts/AdminContext"
import { useRouter } from "next/navigation"
import styles from "./degrees.module.css"

export default function DegreesPage() {
  const { data: session } = useSession()
  const { setActionButtons } = useAdmin()
  const router = useRouter()

  const [degrees, setDegrees] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [formMode, setFormMode] = useState("add") // 'add' or 'edit'
  const [formData, setFormData] = useState({ name: "", code: "" })
  const [selectedDegree, setSelectedDegree] = useState(null)

  useEffect(() => {
    fetchDegrees()
  }, [])

  useEffect(() => {
    setActionButtons([
      {
        label: "Add Degree",
        onClick: () => {
          setFormMode("add")
          setFormData({ name: "", code: "" })
          setShowForm(true)
        },
        className: styles.primaryButton,
      },
      { label: "Logout", onClick: () => signOut() },
    ])
  }, [setActionButtons])

  const fetchDegrees = async () => {
    try {
      const response = await fetch("/api/degree")
      const data = await response.json()
      setDegrees(data)
    } catch (error) {
      console.error("Error fetching degrees:", error)
    }
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()

    try {
      if (formMode === "add") {
        await fetch("/api/degree", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })
      } else {
        await fetch("/api/degree", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: selectedDegree.code, ...formData }),
        })
      }

      setShowForm(false)
      fetchDegrees()
    } catch (error) {
      console.error("Error saving degree:", error)
    }
  }

  const handleDeleteDegree = async (degree) => {
    if (window.confirm(`Are you sure you want to delete ${degree.name}?`)) {
      try {
        await fetch("/api/degree", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: degree.code }),
        })
        fetchDegrees()
      } catch (error) {
        console.error("Error deleting degree:", error)
      }
    }
  }

  const handleEditDegree = (degree) => {
    setSelectedDegree(degree)
    setFormData({ name: degree.name, code: degree.code })
    setFormMode("edit")
    setShowForm(true)
  }

  const viewDegreeDetails = (degree) => {
    router.push(`/admin/degrees/${degree.code}`)
  }

  return (
    <div className={styles.degreesContainer}>
      {showForm && (
        <div className={styles.formContainer}>
          <h2 className={styles.formTitle}>{formMode === "add" ? "Add New Degree" : "Edit Degree"}</h2>
          <form onSubmit={handleFormSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="code">Degree Code</label>
              <input type="text" id="code" name="code" value={formData.code} onChange={handleFormChange} required disabled={formMode === "edit"} />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="name">Degree Name</label>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleFormChange} required />
            </div>
            <div className={styles.buttonGroup}>
              <button type="submit" className={`${styles.button} ${styles.primaryButton}`}>
                {formMode === "add" ? "Add Degree" : "Update Degree"}
              </button>
              <button type="button" className={`${styles.button} ${styles.secondaryButton}`} onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className={styles.degreesList}>
        {degrees.map((degree) => (
          <div key={degree.code} className={styles.degreeItem} onClick={() => viewDegreeDetails(degree)}>
            <div className={styles.actionButtons}>
              <button
                className={`${styles.actionButton}`}
                onClick={(e) => {
                  e.stopPropagation()
                  handleEditDegree(degree)
                }}
              >
                ✏️
              </button>
              <button
                className={`${styles.actionButton} ${styles.deleteButton}`}
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteDegree(degree)
                }}
              >
                🗑️
              </button>
            </div>
            <h2>{degree.name}</h2>
            <div className={styles.degreeCode}>{degree.code}</div>
            <div className={styles.courseCount}>
              {degree.courses?.length || 0} Course{degree.courses?.length !== 1 ? "s" : ""}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
