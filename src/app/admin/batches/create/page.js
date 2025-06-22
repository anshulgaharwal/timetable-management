"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import styles from "./create.module.css"
import { degreeCourseMap } from "../../../utils/degreeCourseMap"

export default function CreateBatchPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    degree: "",
    course: "",
    startYear: new Date().getFullYear(),
    endYear: new Date().getFullYear() + 4
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    
    setFormData(prev => {
      // If changing degree, reset course
      if (name === "degree") {
        return { ...prev, [name]: value, course: "" }
      }
      
      // If changing startYear, update endYear based on typical program duration
      if (name === "startYear") {
        const startYearNum = parseInt(value)
        let duration = 4 // default to 4 years
        
        // Set duration based on degree type
        if (formData.degree.includes("BTech")) duration = 4
        else if (formData.degree.includes("MTech") || formData.degree.includes("MSc")) duration = 2
        else if (formData.degree.includes("PhD")) duration = 5
        
        return { 
          ...prev, 
          [name]: value,
          endYear: startYearNum + duration
        }
      }
      
      return { ...prev, [name]: value }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const res = await fetch("/api/admin/batches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          startYear: parseInt(formData.startYear),
          endYear: parseInt(formData.endYear)
        })
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to create batch")
      }

      const { batch } = await res.json()
      router.push(`/admin/batches/${batch.id}`)
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
      <div className={styles.formCard}>
        <div className={styles.formHeader}>
          <h2>Create New Batch</h2>
          <p>Add a new student batch to the system</p>
        </div>

        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="degree">Degree Program</label>
            <select 
              id="degree" 
              name="degree"
              value={formData.degree}
              onChange={handleChange}
              required
              className={styles.select}
            >
              <option value="">Select Degree</option>
              {Object.keys(degreeCourseMap).map(degree => (
                <option key={degree} value={degree}>{degree}</option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="course">Course</label>
            <select 
              id="course" 
              name="course"
              value={formData.course}
              onChange={handleChange}
              required
              disabled={!formData.degree}
              className={styles.select}
            >
              <option value="">Select Course</option>
              {formData.degree && degreeCourseMap[formData.degree]?.map(course => (
                <option key={course} value={course}>{course}</option>
              ))}
            </select>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="startYear">Start Year</label>
              <select 
                id="startYear" 
                name="startYear"
                value={formData.startYear}
                onChange={handleChange}
                required
                className={styles.select}
              >
                {yearOptions.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="endYear">End Year</label>
              <select 
                id="endYear" 
                name="endYear"
                value={formData.endYear}
                onChange={handleChange}
                required
                className={styles.select}
              >
                {yearOptions.map(year => (
                  <option key={year} value={year} disabled={year < formData.startYear}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.formActions}>
            <button 
              type="button" 
              onClick={() => router.back()}
              className={styles.cancelButton}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Batch"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 