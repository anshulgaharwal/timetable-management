"use client"

import { useState, useEffect, useTransition } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useLayout } from "../../../../contexts/LayoutContext"
import LoadingSpinner from "../../../../components/LoadingSpinner"
import Modal from "../../../../components/Modal"
import styles from "../polls.module.css"

export default function AdminPollDetailPage() {
  const { pollId } = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [isPending, startTransition] = useTransition()
  const { setActionButtons } = useLayout()

  const [pollData, setPollData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isToggling, setIsToggling] = useState(false)
  const [selectedOption, setSelectedOption] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // Set initial action buttons
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

    // Fetch poll data immediately
    fetchPollData()

    return () => {
      setActionButtons([])
    }
  }, [pollId])

  // Update action buttons when poll data changes
  useEffect(() => {
    if (pollData?.poll) {
      const poll = pollData.poll
      const canEdit = pollData.canEdit
      
      const buttons = [
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
      ]

      if (canEdit) {
        buttons.push(
          {
            label: poll.isActive ? "Deactivate" : "Activate",
            icon: poll.isActive ? "⏸️" : "▶️",
            onClick: togglePollStatus,
            variant: "secondary",
            disabled: isToggling,
          },
          {
            label: "Edit Poll",
            icon: "✏️",
            onClick: () => {
              startTransition(() => {
                router.push(`/admin/polls/edit/${pollId}`)
              })
            },
            variant: "primary",
          },
          {
            label: "Delete",
            icon: "🗑️",
            onClick: () => setShowDeleteModal(true),
            variant: "danger",
          }
        )
      }

      setActionButtons(buttons)
    }
  }, [pollData, isToggling])

  const fetchPollData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/polls/${pollId}/details`)
      if (!response.ok) {
        throw new Error(`Failed to fetch poll data: ${response.status}`)
      }

      const data = await response.json()
      setPollData(data)
    } catch (err) {
      setError(err.message || "Failed to load poll data")
    } finally {
      setLoading(false)
    }
  }

  const togglePollStatus = async () => {
    if (!pollData?.poll) return

    setIsToggling(true)
    setError(null)

    try {
      const res = await fetch(`/api/polls/${pollId}/toggle-status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !pollData.poll.isActive }),
      })

      if (!res.ok) {
        throw new Error("Failed to update poll status")
      }

      setPollData(prevData => ({
        ...prevData,
        poll: { ...prevData.poll, isActive: !prevData.poll.isActive },
      }))
    } catch (err) {
      setError(err.message)
    } finally {
      setIsToggling(false)
    }
  }

  const handleDeletePoll = async () => {
    setIsDeleting(true)
    setError(null)

    try {
      const res = await fetch(`/api/polls/${pollId}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        throw new Error("Failed to delete poll")
      }

      startTransition(() => {
        router.push("/admin/polls")
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleVote = async (e) => {
    e.preventDefault()
    
    if (!selectedOption) {
      setError("Please select an option")
      return
    }
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      const res = await fetch("/api/polls/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pollId, optionId: selectedOption }),
      })
      
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to submit your response")
      }

      // Refresh poll data to show updated results
      await fetchPollData()
      setSelectedOption("")
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner size="large" />
        <p>Loading poll data...</p>
      </div>
    )
  }

  if (!pollData?.poll) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorMessage}>
          {error || "Poll not found"}
        </div>
        <button 
          className={styles.backButton} 
          onClick={() => router.push("/admin/polls")}
        >
          Back to Polls
        </button>
      </div>
    )
  }

  const { poll, responsesByOption, totalResponses, hasVoted, isExpired, canEdit } = pollData
  
  // Check if poll is available for voting
  const canVote = session && poll.isActive && !isExpired && 
                 (!hasVoted || poll.allowMultiple) && 
                 (!poll.batchId || session.user.batchId === poll.batchId)

  return (
    <div className={styles.pollsContainer}>
      {error && <div className={styles.errorMessage}>{error}</div>}

      <div className={styles.pollDetail}>
        <div className={styles.pollDetailHeader}>
          <h1 className={styles.pollDetailTitle}>{poll.title}</h1>
          <span className={`${styles.statusBadge} ${poll.isActive ? styles.active : styles.inactive}`}>
            {poll.isActive ? "Active" : "Inactive"}
          </span>
        </div>

        <div className={styles.pollMeta}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Created by</span>
            <span className={styles.metaValue}>{poll.creator?.name || "Unknown"}</span>
          </div>
          {poll.category && (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Category</span>
              <span className={styles.metaValue}>{poll.category}</span>
            </div>
          )}
          {poll.expiresAt && (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Expires</span>
              <span className={styles.metaValue}>{new Date(poll.expiresAt).toLocaleString()}</span>
            </div>
          )}
          {poll.batch && (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Target Batch</span>
              <span className={styles.metaValue}>
                {poll.batch.departmentName} ({poll.batch.startYear}-{poll.batch.endYear})
              </span>
            </div>
          )}
        </div>

        <div className={styles.pollDetailQuestion}>{poll.question}</div>

        {poll.description && (
          <div className={styles.pollDetailDescription}>{poll.description}</div>
        )}

        {canVote ? (
          <div className={styles.votingSection}>
            <h3>{poll.allowMultiple ? "Select options" : "Select an option"}</h3>
            <form onSubmit={handleVote}>
              {poll.options?.map((option) => (
                <div className={styles.optionSelect} key={option.id}>
                  <input
                    type={poll.allowMultiple ? "checkbox" : "radio"}
                    id={option.id}
                    name="pollOption"
                    value={option.id}
                    checked={selectedOption === option.id}
                    onChange={() => setSelectedOption(option.id)}
                  />
                  <label htmlFor={option.id}>{option.text}</label>
                </div>
              ))}
              <button 
                type="submit" 
                className={styles.submitButton} 
                disabled={isSubmitting || !selectedOption}
              >
                {isSubmitting ? "Submitting..." : "Submit Vote"}
              </button>
            </form>
          </div>
        ) : (
          <div className={styles.optionsList}>
            <h3>Options</h3>
            <ul className={styles.pollOptions}>
              {poll.options?.map((option) => (
                <li key={option.id}>{option.text}</li>
              ))}
            </ul>
            {!session && <p className={styles.note}>Sign in to vote on this poll</p>}
            {hasVoted && <p className={styles.note}>You have already voted on this poll</p>}
            {isExpired && <p className={styles.note}>This poll has expired</p>}
            {!poll.isActive && <p className={styles.note}>This poll is currently inactive</p>}
          </div>
        )}
      </div>

      <div className={styles.resultsContainer}>
        <h2 className={styles.resultsHeader}>Results</h2>
        <p className={styles.totalResponses}>Total Responses: {totalResponses}</p>

        {totalResponses === 0 ? (
          <p>No responses yet.</p>
        ) : (
          responsesByOption.map((opt) => {
            const percent = totalResponses === 0 ? 0 : Math.round((opt.count / totalResponses) * 100)
            return (
              <div className={styles.resultItem} key={opt.optionId}>
                <div className={styles.resultLabel}>
                  <span>{opt.text}: {opt.count} votes</span>
                  <span>{percent}%</span>
                </div>
                <div className={styles.resultBarContainer}>
                  <div 
                    className={styles.resultBar} 
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Show detailed responses for admins, professors, or poll creators */}
      {pollData.detailedResponses && (
        <div className={styles.resultsContainer}>
          <h2 className={styles.resultsHeader}>Detailed Responses</h2>
          {pollData.detailedResponses.length === 0 ? (
            <p>No responses yet.</p>
          ) : (
            <div className={styles.pollTable}>
              <table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Response</th>
                    <th>Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {pollData.detailedResponses.map((response) => (
                    <tr key={response.id}>
                      <td>{response.user.name || response.user.email}</td>
                      <td>{response.option.text}</td>
                      <td>{new Date(response.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Delete Poll Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setError(null)
        }}
        title="Confirm Deletion"
        size="small"
        footerButtons={{
          cancel: {
            text: "Cancel",
            onClick: () => {
              setShowDeleteModal(false)
              setError(null)
            },
          },
          confirm: {
            text: isDeleting ? "Deleting..." : "Delete Poll",
            onClick: handleDeletePoll,
            disabled: isDeleting,
            variant: "danger",
          },
        }}
      >
        {error && <div className={styles.errorMessage}>{error}</div>}

        <p>
          Are you sure you want to delete the poll <strong>{poll?.title}</strong>? 
          This action cannot be undone and will remove all associated responses.
        </p>
      </Modal>
    </div>
  )
}
