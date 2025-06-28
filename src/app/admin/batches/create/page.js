"use client"

import { useState, useEffect, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useLayout } from "../../../../contexts/LayoutContext"
import LoadingSpinner from "../../../../components/LoadingSpinner"
import styles from "./create.module.css"

export default function CreateBatchPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const { setActionButtons } = useLayout()
  const [formData, setFormData] = useState({
    degreeId: "",
    courseCode: "",
    startYear: new Date().getFullYear(),
    endYear: new Date().getFullYear() + 4,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [degrees, setDegrees] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  // Set action buttons immediately
  useEffect(() => {
    setActionButtons([
      {
        label: "Back to Batches",
        icon: "←",
        onClick: () => {
          startTransition(() => {
            router.push("/admin/batches")
          })
        },
        variant: "secondary"
      },
    ])

    // Fetch degrees immediately
    fetchDegrees()

    return () => setActionButtons([])
  }, [setActionButtons, router])

  const fetchDegrees = async () => {
    try {
      const res = await fetch("/api/degree")

      if (!res.ok) {
        throw new Error("Failed to fetch degrees")
      }

      const data = await res.json()
      setDegrees(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

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

  const handleChange = (e) => {
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.degreeId || !formData.courseCode) {
      setError("Please select both degree and course")
      return
    }

    setIsSubmitting(true)
    setError(null)

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
      startTransition(() => {
        router.push(`/admin/batches/${batch.id}`)
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i)

  return (
    <div className={styles.createContainer}>
      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}

      {loading ? (
        <div className={styles.loadingContainer}>
          <LoadingSpinner size="large" />
          <p>Loading degree programs...</p>
        </div>
      ) : (
        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <h2>Create New Batch</h2>
            <p>Add a new student batch to the system</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="degreeId">Degree Program</label>
            <select id="degreeId" name="degreeId" value={formData.degreeId} onChange={handleChange} required className={styles.select}>
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
            <select id="courseCode" name="courseCode" value={formData.courseCode} onChange={handleChange} required disabled={!formData.degreeId || courses.length === 0} className={styles.select}>
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
            <button type="button" onClick={() => router.back()} className={styles.cancelButton} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Batch"}
            </button>
          </div>
          </form>
        </div>
      )}
    </div>
  )
}
