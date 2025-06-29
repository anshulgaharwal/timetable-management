"use client"
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import LoadingSpinner from "../../../../../components/LoadingSpinner"
import styles from "./respond.module.css"

export default function RespondToPoll() {
  const router = useRouter()
  const { pollId } = useParams()
  const { data: session, status } = useSession()

  const [poll, setPoll] = useState(null)
  const [selectedOptionId, setSelectedOptionId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/signin")
      return
    }
  }, [status, router])

  // Protect route from unauthorized roles
  useEffect(() => {
    if (status === "authenticated") {
      if (!session) return
      if (session.user.role.toLowerCase() !== "student") {
        router.replace("/unauthorized")
        return
      }
    }
  }, [status, session, router])

  useEffect(() => {
    if (status === "authenticated" && pollId) {
      fetchPoll()
    }
  }, [status, pollId])

  const fetchPoll = async () => {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch(`/api/polls/${pollId}`)
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to load poll")
      }

      setPoll(data.poll)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedOptionId) {
      setError("Please select an option.")
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch("/api/polls/respond", {
        method: "POST",
        body: JSON.stringify({ pollId, optionId: selectedOptionId }),
        headers: { "Content-Type": "application/json" },
      })

      const data = await res.json()

      if (res.ok) {
        router.push("/student/polls/respond/success")
      } else {
        setError(data.error || "Failed to submit response.")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const goBack = () => {
    router.push("/student/polls")
  }

  const formatDate = (dateString) => {
    if (!dateString) return "No expiry"
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getCategoryIcon = (category) => {
    const icons = {
      academic: "📚",
      feedback: "💬",
      event: "📅",
      general: "📋",
      announcement: "📢",
    }
    return icons[category?.toLowerCase()] || "📊"
  }

  // Show loading while session is being checked
  if (status === "loading") {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner size="large" />
        <p>Loading...</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner size="medium" />
        <p>Loading poll...</p>
      </div>
    )
  }

  if (error && !poll) {
    return (
      <div className={styles.errorContainer}>
        <h1>❌ Error</h1>
        <p>{error}</p>
        <button onClick={goBack} className={styles.backButton}>
          ← Go Back
        </button>
      </div>
    )
  }

  if (!poll) {
    return (
      <div className={styles.errorContainer}>
        <h1>❌ Poll Not Found</h1>
        <p>The poll you're looking for doesn't exist or has been removed.</p>
        <button onClick={goBack} className={styles.backButton}>
          ← Go Back
        </button>
      </div>
    )
  }

  if (!poll.isActive) {
    return (
      <div className={styles.errorContainer}>
        <h1>🔒 Poll Closed</h1>
        <p>This poll is no longer accepting responses.</p>
        <button onClick={goBack} className={styles.backButton}>
          ← Go Back
        </button>
      </div>
    )
  }

  if (poll.expiresAt && new Date(poll.expiresAt) <= new Date()) {
    return (
      <div className={styles.errorContainer}>
        <h1>⏰ Poll Expired</h1>
        <p>This poll has expired and is no longer accepting responses.</p>
        <p>Expired on: {formatDate(poll.expiresAt)}</p>
        <button onClick={goBack} className={styles.backButton}>
          ← Go Back
        </button>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.pollHeader}>
        <button onClick={goBack} className={styles.backButton}>
          ← Back to Polls
        </button>

        <div className={styles.pollMeta}>
          <div className={styles.categoryInfo}>
            <span className={styles.categoryIcon}>{getCategoryIcon(poll.category)}</span>
            <span className={styles.category}>{poll.category || "General"}</span>
          </div>
          {poll.expiresAt && <div className={styles.expiryInfo}>⏰ Expires: {formatDate(poll.expiresAt)}</div>}
        </div>
      </div>

      <div className={styles.pollContent}>
        <h1>{poll.title}</h1>
        <p className={styles.pollQuestion}>{poll.question}</p>

        {poll.description && <p className={styles.pollDescription}>{poll.description}</p>}

        {error && <div className={styles.errorMessage}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className={styles.optionsContainer}>
            {poll.options.map((opt) => (
              <div key={opt.id} className={styles.optionItem}>
                <input type="radio" id={opt.id} name="option" value={opt.id} onChange={() => setSelectedOptionId(opt.id)} required disabled={submitting} />
                <label htmlFor={opt.id}>{opt.text}</label>
              </div>
            ))}
          </div>

          <button type="submit" disabled={submitting || !selectedOptionId} className={styles.submitButton}>
            {submitting ? (
              <>
                <LoadingSpinner size="small" />
                Submitting...
              </>
            ) : (
              "Submit Response"
            )}
          </button>
        </form>
      </div>

      <div className={styles.pollFooter}>
        <div className={styles.pollInfo}>
          <span>Created by: {poll.creator?.name || "Unknown"}</span>
          <span>{poll._count?.responses || 0} responses so far</span>
        </div>
      </div>
    </div>
  )
}
