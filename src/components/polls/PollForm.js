"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import "./polls.css"

export default function PollForm({ pollId = null, baseUrl, isEdit = false, returnUrl = null }) {
  const router = useRouter()
  const [loading, setLoading] = useState(isEdit)
  const [title, setTitle] = useState("")
  const [question, setQuestion] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [expiresAt, setExpiresAt] = useState("")
  const [allowMultiple, setAllowMultiple] = useState(false)
  const [batchId, setBatchId] = useState("")
  const [options, setOptions] = useState(["", ""])
  const [originalOptions, setOriginalOptions] = useState([])
  const [batches, setBatches] = useState([])
  const [formErrors, setFormErrors] = useState({})

  // Fetch batches for dropdown
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const res = await fetch('/api/batches')
        if (res.ok) {
          const data = await res.json()
          setBatches(data.batches)
        }
      } catch (error) {
        console.error("Error fetching batches:", error)
      }
    }
    
    fetchBatches()
  }, [])

  useEffect(() => {
    if (isEdit && pollId) {
      const fetchPoll = async () => {
        try {
          const res = await fetch(`/api/polls/${pollId}`)
          const data = await res.json()

          setTitle(data.poll.title)
          setQuestion(data.poll.question)
          setDescription(data.poll.description || "")
          setCategory(data.poll.category || "")
          setAllowMultiple(data.poll.allowMultiple || false)
          setBatchId(data.poll.batchId ? String(data.poll.batchId) : "")
          
          if (data.poll.expiresAt) {
            // Format date for datetime-local input
            const date = new Date(data.poll.expiresAt)
            const formattedDate = date.toISOString().slice(0, 16)
            setExpiresAt(formattedDate)
          }

          // Convert options from the API format to the format needed for editing
          const pollOptions = data.poll.options.map((opt) => opt.text)
          setOptions(pollOptions)
          setOriginalOptions(data.poll.options)

          setLoading(false)
        } catch (error) {
          console.error("Error fetching poll:", error)
          setLoading(false)
        }
      }

      fetchPoll()
    }
  }, [isEdit, pollId])

  const addOption = () => setOptions([...options, ""])

  const removeOption = (index) => {
    const newOptions = [...options]
    newOptions.splice(index, 1)
    setOptions(newOptions)
  }

  const handleOptionChange = (value, index) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  const validateForm = () => {
    const errors = {}
    
    if (!title.trim()) errors.title = "Title is required"
    if (!question.trim()) errors.question = "Question is required"
    
    // Check options
    if (options.length < 2) {
      errors.options = "At least 2 options are required"
    } else {
      const emptyOptions = options.filter(opt => !opt.trim()).length
      if (emptyOptions > 0) {
        errors.options = "All options must have content"
      }
    }
    
    // Validate expiration date if provided
    if (expiresAt) {
      const expiryDate = new Date(expiresAt)
      const now = new Date()
      if (expiryDate <= now) {
        errors.expiresAt = "Expiration date must be in the future"
      }
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate form
    if (!validateForm()) {
      return
    }

    try {
      let res

      // Prepare data for API
      const pollData = {
        title,
        question,
        options,
        description: description.trim() || null,
        category: category.trim() || null,
        expiresAt: expiresAt || null,
        allowMultiple,
        batchId: batchId || null
      }

      if (isEdit) {
        // Update existing poll
        res = await fetch(`/api/polls/${pollId}`, {
          method: "PUT",
          body: JSON.stringify({
            ...pollData,
            originalOptions,
          }),
          headers: { "Content-Type": "application/json" },
        })
      } else {
        // Create new poll
        res = await fetch("/api/polls", {
          method: "POST",
          body: JSON.stringify(pollData),
          headers: { "Content-Type": "application/json" },
        })
      }

      if (res.ok) {
        const data = await res.json()
        router.push(returnUrl || (isEdit ? `${baseUrl}/${pollId}` : baseUrl))
      } else {
        const errorData = await res.json()
        alert(`Error ${isEdit ? "updating" : "creating"} poll: ${errorData.error || "Unknown error"}`)
      }
    } catch (error) {
      console.error(`Error ${isEdit ? "updating" : "creating"} poll:`, error)
      alert(`An error occurred while ${isEdit ? "updating" : "creating"} the poll`)
    }
  }

  if (loading) {
    return (
      <main className="container">
        <div className="actions-container">
          <Link href={returnUrl || baseUrl} className="btn-secondary">
            ← Back
          </Link>
        </div>
        <p>Loading poll data...</p>
      </main>
    )
  }

  return (
    <main className="container">
      <div className="actions-container">
        <Link href={returnUrl || baseUrl} className="btn-secondary">
          ← Back
        </Link>
      </div>

      <h1>{isEdit ? "Edit Poll" : "Create a New Poll"}</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Poll Title</label>
          <input 
            type="text" 
            id="title"
            placeholder="Poll Title" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
          />
          {formErrors.title && <div className="error-message">{formErrors.title}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="question">Question</label>
          <textarea 
            id="question"
            placeholder="Poll Question" 
            value={question} 
            onChange={(e) => setQuestion(e.target.value)} 
          />
          {formErrors.question && <div className="error-message">{formErrors.question}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="description">Description (Optional)</label>
          <textarea 
            id="description"
            placeholder="Additional details about this poll" 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="category">Category (Optional)</label>
            <input 
              type="text" 
              id="category"
              placeholder="e.g., Academic, Events, Feedback" 
              value={category} 
              onChange={(e) => setCategory(e.target.value)} 
            />
          </div>

          <div className="form-group">
            <label htmlFor="expiresAt">Expiration Date (Optional)</label>
            <input 
              type="datetime-local" 
              id="expiresAt"
              value={expiresAt} 
              onChange={(e) => setExpiresAt(e.target.value)} 
            />
            {formErrors.expiresAt && <div className="error-message">{formErrors.expiresAt}</div>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group checkbox-group">
            <input 
              type="checkbox" 
              id="allowMultiple"
              checked={allowMultiple} 
              onChange={(e) => setAllowMultiple(e.target.checked)} 
            />
            <label htmlFor="allowMultiple">Allow multiple selections</label>
          </div>

          <div className="form-group">
            <label htmlFor="batchId">Target Batch (Optional)</label>
            <select 
              id="batchId"
              value={batchId} 
              onChange={(e) => setBatchId(e.target.value)}
            >
              <option value="">All Batches</option>
              {batches.map(batch => (
                <option key={batch.id} value={batch.id}>
                  {batch.degree} {batch.course} ({batch.startYear}-{batch.endYear})
                </option>
              ))}
            </select>
          </div>
        </div>

        <h3>Options:</h3>
        {formErrors.options && <div className="error-message">{formErrors.options}</div>}
        {options.map((opt, i) => (
          <div className="option-row" key={i}>
            <input 
              type="text" 
              placeholder={`Option ${i + 1}`} 
              value={opt} 
              onChange={(e) => handleOptionChange(e.target.value, i)} 
            />
            {options.length > 2 && (
              <button type="button" onClick={() => removeOption(i)} className="remove-button">
                ✖
              </button>
            )}
          </div>
        ))}

        <button type="button" onClick={addOption} className="add-button">
          Add Option
        </button>

        <button type="submit" className="submit-button">
          {isEdit ? "Update Poll" : "Publish Poll"}
        </button>
      </form>
    </main>
  )
}
