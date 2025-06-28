"use client"

import { useState, useEffect, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useLayout } from "../../../../../contexts/LayoutContext"
import LoadingSpinner from "../../../../../components/LoadingSpinner"
import styles from "./edit.module.css"

export default function EditBatchPage({ params }) {
  const { id } = params
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const { setActionButtons } = useLayout()

  const [batch, setBatch] = useState(null)
  const [formData, setFormData] = useState({
    departmentCode: "",
    startYear: new Date().getFullYear(),
    endYear: new Date().getFullYear() + 4,
  })
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [degrees, setDegrees] = useState([])
  const [departments, setDepartments] = useState([])
  const [selectedDegreeId, setSelectedDegreeId] = useState("")

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch batch details
      const batchRes = await fetch(`/api/admin/batches/${id}`)
      if (!batchRes.ok) {
        throw new Error("Failed to fetch batch details")
      }
      const batchData = await batchRes.json()
      setBatch(batchData.batch)

      // Set initial form data
      setFormData({
        departmentCode: batchData.batch.departmentCode,
        startYear: batchData.batch.startYear,
        endYear: batchData.batch.endYear,
      })

      // Set selected degree
      if (batchData.batch.department?.degree) {
        setSelectedDegreeId(batchData.batch.department.degree.code)
      }

      // Fetch all degrees
      const degreesRes = await fetch("/api/degree")
      if (!degreesRes.ok) {
        throw new Error("Failed to fetch degrees")
      }
      const degreesData = await degreesRes.json()
      setDegrees(degreesData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Set action buttons immediately
    setActionButtons([
      {
        label: "Back to Batch",
        icon: "←",
        onClick: () => {
          startTransition(() => {
            router.push(`/admin/batches/${id}`)
          })
        },
        variant: "secondary"
      },
    ])

    // Fetch data immediately
    fetchData()

    return () => setActionButtons([])
  }, [id, router, setActionButtons])

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

  const handleChange = (e) => {
    const { name, value } = e.target

    if (name === "degreeId") {
      setSelectedDegreeId(value)
      setFormData((prev) => ({ ...prev, departmentCode: "" }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const res = await fetch(`/api/admin/batches/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          startYear: parseInt(formData.startYear),
          endYear: parseInt(formData.endYear),
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to update batch")
      }

      router.push(`/admin/batches/${id}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i)

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className={styles.editContainer}>
      <div className={styles.formCard}>
        <div className={styles.formHeader}>
          <h2>Edit Batch</h2>
          <p>Update batch information</p>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="degreeId">Degree Program</label>
            <select id="degreeId" name="degreeId" value={selectedDegreeId} onChange={handleChange} required className={styles.select}>
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
            <select id="departmentCode" name="departmentCode" value={formData.departmentCode} onChange={handleChange} required disabled={!selectedDegreeId || departments.length === 0} className={styles.select}>
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
              <select id="startYear" name="startYear" value={formData.startYear} onChange={handleChange} required className={styles.select}>
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="endYear">End Year</label>
              <select id="endYear" name="endYear" value={formData.endYear} onChange={handleChange} required className={styles.select}>
                {yearOptions.map((year) => (
                  <option key={year} value={year} disabled={year < formData.startYear}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.formActions}>
            <button type="button" onClick={() => router.push(`/admin/batches/${id}`)} className={styles.cancelButton} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
