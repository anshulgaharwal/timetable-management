"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import "./polls.css"

export default function PollDetail({ pollId, baseUrl }) {
  const router = useRouter()
  const { data: session } = useSession()
  const [pollData, setPollData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedOption, setSelectedOption] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchPollData = async () => {
      try {
        // Use the combined endpoint to fetch poll details and results in one request
        const response = await fetch(`/api/polls/${pollId}/details`)

        if (!response.ok) {
          throw new Error(`Failed to fetch poll data: ${response.status}`)
        }

        const data = await response.json()
        setPollData(data)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching poll data:", error)
        setError("Failed to load poll data")
        setLoading(false)
      }
    }

    fetchPollData()
  }, [pollId])

  const togglePollStatus = async () => {
    if (!pollData?.poll) return

    try {
      const res = await fetch(`/api/polls/${pollId}/toggle-status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !pollData.poll.isActive }),
      })

      if (res.ok) {
        setPollData({
          ...pollData,
          poll: { ...pollData.poll, isActive: !pollData.poll.isActive },
        })
      } else {
        setError("Failed to update poll status")
      }
    } catch (error) {
      console.error("Error toggling poll status:", error)
      setError("An error occurred while updating the poll")
    }
  }

  const handleEdit = () => {
    router.push(`${baseUrl}/edit/${pollId}`)
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this poll? This action cannot be undone.")) {
      return
    }

    try {
      const res = await fetch(`/api/polls/${pollId}`, {
        method: "DELETE",
      })

      if (res.ok) {
        router.push(baseUrl)
      } else {
        setError("Failed to delete poll")
      }
    } catch (error) {
      console.error("Error deleting poll:", error)
      setError("An error occurred while deleting the poll")
    }
  }

  const handleVote = async (e) => {
    e.preventDefault()
    
    if (!selectedOption) {
      setError("Please select an option")
      return
    }
    
    setSubmitting(true)
    setError(null)
    
    try {
      const res = await fetch("/api/polls/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pollId, optionId: selectedOption }),
      })
      
      if (res.ok) {
        // Refresh poll data to show updated results
        const response = await fetch(`/api/polls/${pollId}/details`)
        const data = await response.json()
        setPollData(data)
        setSelectedOption("")
      } else {
        const errorData = await res.json()
        setError(errorData.error || "Failed to submit your response")
      }
    } catch (error) {
      console.error("Error submitting response:", error)
      setError("An error occurred while submitting your response")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <main className="container">
        <div className="actions-container">
          <Link href={baseUrl} className="btn-secondary">
            ← Back to Polls
          </Link>
        </div>
        <p>Loading poll data...</p>
      </main>
    )
  }

  if (!pollData?.poll) {
    return (
      <main className="container">
        <div className="actions-container">
          <Link href={baseUrl} className="btn-secondary">
            ← Back to Polls
          </Link>
        </div>
        <p>Poll not found</p>
      </main>
    )
  }

  const { poll, responsesByOption, totalResponses, hasVoted, isExpired, canEdit } = pollData
  
  // Check if poll is available for voting
  const canVote = session && poll.isActive && !isExpired && 
                 (!hasVoted || poll.allowMultiple) && 
                 (!poll.batchId || session.user.batchId === poll.batchId)

  return (
    <main className="container">
      <div className="actions-container">
        <Link href={baseUrl} className="btn-secondary">
          ← Back to Polls
        </Link>
      </div>

      {error && <div className="error-alert">{error}</div>}

      <div className="poll-header">
        <h1>{poll.title}</h1>
        <div className="poll-meta">
          <div>
            <span className="meta-label">Created by:</span> {poll.creator?.name || "Unknown"}
          </div>
          {poll.category && (
            <div>
              <span className="meta-label">Category:</span> {poll.category}
            </div>
          )}
          {poll.expiresAt && (
            <div>
              <span className="meta-label">Expires:</span> {new Date(poll.expiresAt).toLocaleString()}
            </div>
          )}
          {poll.batch && (
            <div>
              <span className="meta-label">For batch:</span> {poll.batch.degree} {poll.batch.course} ({poll.batch.startYear}-{poll.batch.endYear})
            </div>
          )}
        </div>
        
        {canEdit && (
          <div className="poll-status-actions">
            <span className={`status-indicator ${poll.isActive ? "active" : "inactive"}`}>
              {poll.isActive ? "Active" : "Inactive"}
            </span>
            <button onClick={togglePollStatus} className="btn-secondary">
              {poll.isActive ? "Deactivate" : "Activate"}
            </button>
            <button onClick={handleEdit} className="btn-primary">
              Edit Poll
            </button>
            <button onClick={handleDelete} className="btn-danger">
              Delete
            </button>
          </div>
        )}
      </div>

      <div className="poll-details">
        <h2>Question</h2>
        <p className="poll-question">{poll.question}</p>
        
        {poll.description && (
          <>
            <h3>Description</h3>
            <p className="poll-description">{poll.description}</p>
          </>
        )}

        {canVote ? (
          <div className="voting-section">
            <h3>{poll.allowMultiple ? "Select options" : "Select an option"}</h3>
            <form onSubmit={handleVote}>
              {poll.options?.map((option) => (
                <div className="option-select" key={option.id}>
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
              <button type="submit" className="btn-primary" disabled={submitting || !selectedOption}>
                {submitting ? "Submitting..." : "Submit Vote"}
              </button>
            </form>
          </div>
        ) : (
          <div className="options-list">
            <h3>Options</h3>
            <ul className="poll-options">
              {poll.options?.map((option) => (
                <li key={option.id}>{option.text}</li>
              ))}
            </ul>
            {!session && <p className="note">Sign in to vote on this poll</p>}
            {hasVoted && <p className="note">You have already voted on this poll</p>}
            {isExpired && <p className="note">This poll has expired</p>}
            {!poll.isActive && <p className="note">This poll is currently inactive</p>}
          </div>
        )}
      </div>

      <div className="poll-results">
        <h2>Results</h2>
        <p>Total Responses: {totalResponses}</p>

        {totalResponses === 0 ? (
          <p>No responses yet.</p>
        ) : (
          responsesByOption.map((opt) => {
            const percent = totalResponses === 0 ? 0 : Math.round((opt.count / totalResponses) * 100)
            return (
              <div className="result-item" key={opt.optionId}>
                <div className="result-label">
                  {opt.text}: {opt.count} votes ({percent}%)
                </div>
                <div className="result-bar-container">
                  <div className="result-bar" style={{ width: `${percent}%` }}>
                    {percent}%
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Show detailed responses for admins, professors, or poll creators */}
      {pollData.detailedResponses && (
        <div className="detailed-responses">
          <h2>Detailed Responses</h2>
          {pollData.detailedResponses.length === 0 ? (
            <p>No responses yet.</p>
          ) : (
            <table className="responses-table">
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
          )}
        </div>
      )}
    </main>
  )
}
