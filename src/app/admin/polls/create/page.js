"use client"

import { useState, useEffect, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useLayout } from "../../../../contexts/LayoutContext"
import LoadingSpinner from "../../../../components/LoadingSpinner"
import styles from "../polls.module.css"

export default function AdminCreatePollPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const { setActionButtons } = useLayout()

  const [loading, setLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [batches, setBatches] = useState([])
  const [batchesLoading, setBatchesLoading] = useState(true)

  const [formData, setFormData] = useState({
    title: "",
    question: "",
    description: "",
    category: "",
    expiresAt: "",
    allowMultiple: false,
    batchId: "",
    options: ["", ""],
  })

  useEffect(() => {
    // Set action buttons immediately
    setActionButtons([
      {
        label: "Back to Polls",
        icon: "←",
        onClick: () => {
          startTransition(() => {
            router.push("/admin/polls")
          })
        },
        variant: "secondary",
      },
    ])

    // Fetch batches immediately
    fetchBatches()

    return () => {
      setActionButtons([])
    }
  }, [])

  const fetchBatches = async () => {
    try {
      setBatchesLoading(true)
      const res = await fetch("/api/admin/batches")
      if (res.ok) {
        const data = await res.json()
        setBatches(data.batches || [])
      }
    } catch (error) {
      console.error("Error fetching batches:", error)
    } finally {
      setBatchesLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options]
    newOptions[index] = value
    setFormData((prev) => ({ ...prev, options: newOptions }))
  }

  const addOption = () => {
    setFormData((prev) => ({
      ...prev,
      options: [...prev.options, ""],
    }))
  }

  const removeOption = (index) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index)
      setFormData((prev) => ({ ...prev, options: newOptions }))
    }
  }

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError("Title is required")
      return false
    }
    if (!formData.question.trim()) {
      setError("Question is required")
      return false
    }
    if (formData.options.length < 2) {
      setError("At least 2 options are required")
      return false
    }
    const emptyOptions = formData.options.filter((opt) => !opt.trim()).length
    if (emptyOptions > 0) {
      setError("All options must have content")
      return false
    }
    if (formData.expiresAt) {
      const expiryDate = new Date(formData.expiresAt)
      const now = new Date()
      if (expiryDate <= now) {
        setError("Expiration date must be in the future")
        return false
      }
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const pollData = {
        title: formData.title.trim(),
        question: formData.question.trim(),
        options: formData.options.filter((opt) => opt.trim()),
        description: formData.description.trim() || null,
        category: formData.category.trim() || null,
        expiresAt: formData.expiresAt || null,
        allowMultiple: formData.allowMultiple,
        batchId: formData.batchId || null,
      }

      const res = await fetch("/api/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pollData),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to create poll")
      }

      const data = await res.json()

      // Navigate to the newly created poll
      startTransition(() => {
        router.push(`/admin/polls/${data.pollId}`)
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={styles.pollsContainer}>
      <div className={styles.formContainer}>
        <div className={styles.formHeader}>
          <h2>Create New Poll</h2>
          <p>Create a poll for student feedback and voting</p>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="title">Poll Title</label>
            <input type="text" id="title" name="title" value={formData.title} onChange={handleInputChange} required placeholder="Enter poll title" className={styles.input} />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="question">Question</label>
            <textarea id="question" name="question" value={formData.question} onChange={handleInputChange} required placeholder="Enter the poll question" className={styles.textarea} />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Description (Optional)</label>
            <textarea id="description" name="description" value={formData.description} onChange={handleInputChange} placeholder="Additional details about this poll" className={styles.textarea} />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="category">Category (Optional)</label>
              <input type="text" id="category" name="category" value={formData.category} onChange={handleInputChange} placeholder="e.g., Academic, Events, Feedback" className={styles.input} />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="expiresAt">Expiration Date (Optional)</label>
              <input type="datetime-local" id="expiresAt" name="expiresAt" value={formData.expiresAt} onChange={handleInputChange} className={styles.input} />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <div className={styles.checkboxGroup}>
                <input type="checkbox" id="allowMultiple" name="allowMultiple" checked={formData.allowMultiple} onChange={handleInputChange} />
                <label htmlFor="allowMultiple">Allow multiple selections</label>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="batchId">Target Batch (Optional)</label>
              {batchesLoading ? (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px" }}>
                  <LoadingSpinner size="small" />
                  <span>Loading batches...</span>
                </div>
              ) : (
                <select id="batchId" name="batchId" value={formData.batchId} onChange={handleInputChange} className={styles.select}>
                  <option value="">All Batches</option>
                  {batches.map((batch) => (
                    <option key={batch.id} value={batch.id}>
                      {batch.departmentName} ({batch.startYear}-{batch.endYear})
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Options</label>
            {formData.options.map((option, index) => (
              <div key={index} className={styles.optionRow}>
                <input type="text" value={option} onChange={(e) => handleOptionChange(index, e.target.value)} placeholder={`Option ${index + 1}`} className={styles.input} />
                {formData.options.length > 2 && (
                  <button type="button" onClick={() => removeOption(index)} className={styles.removeButton}>
                    ✖
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={addOption} className={styles.addButton}>
              Add Option
            </button>
          </div>

          <div className={styles.formActions}>
            <button type="button" onClick={() => router.push("/admin/polls")} className={styles.cancelButton} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Poll"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
