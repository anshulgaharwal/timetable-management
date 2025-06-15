"use client"
import "../polls.css"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"

export default function ProfessorPollDetailPage() {
  const { pollId } = useParams()
  const router = useRouter()
  const [poll, setPoll] = useState(null)
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPollData = async () => {
      try {
        // Fetch poll details
        // This could be changed to a professor-specific endpoint
        const pollResponse = await fetch(`/api/polls/${pollId}`)
        const pollData = await pollResponse.json()

        // Fetch poll results
        const resultResponse = await fetch(`/api/result/${pollId}`)
        const resultData = await resultResponse.json()

        setPoll(pollData.poll)
        setResults(resultData)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching poll data:", error)
        setLoading(false)
      }
    }

    fetchPollData()
  }, [pollId])

  const togglePollStatus = async () => {
    try {
      const res = await fetch(`/api/polls/${pollId}/toggle-status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !poll.isActive }),
      })

      if (res.ok) {
        setPoll({ ...poll, isActive: !poll.isActive })
      } else {
        alert("Failed to update poll status")
      }
    } catch (error) {
      console.error("Error toggling poll status:", error)
      alert("An error occurred while updating the poll")
    }
  }

  const handleEdit = () => {
    router.push(`/professor/polls/edit/${pollId}`)
  }

  if (loading) {
    return (
      <main className="container">
        <div className="actions-container">
          <Link href="/professor/polls" className="btn-secondary">
            ← Back to Polls
          </Link>
        </div>
        <p>Loading poll data...</p>
      </main>
    )
  }

  if (!poll) {
    return (
      <main className="container">
        <div className="actions-container">
          <Link href="/professor/polls" className="btn-secondary">
            ← Back to Polls
          </Link>
        </div>
        <p>Poll not found</p>
      </main>
    )
  }

  const totalVotes = results?.responsesByOption?.reduce((sum, opt) => sum + opt.count, 0) || 0

  return (
    <main className="container">
      <div className="actions-container">
        <Link href="/professor/polls" className="btn-secondary">
          ← Back to Polls
        </Link>
      </div>

      <div className="poll-header">
        <h1>{poll.title}</h1>
        <div className="poll-status-actions">
          <span className={`status-indicator ${poll.isActive ? "active" : "inactive"}`}>{poll.isActive ? "Active" : "Inactive"}</span>
          <button onClick={togglePollStatus} className="btn-secondary">
            {poll.isActive ? "Deactivate" : "Activate"}
          </button>
          <button onClick={handleEdit} className="btn-primary">
            Edit Poll
          </button>
        </div>
      </div>

      <div className="poll-details">
        <h2>Question</h2>
        <p className="poll-question">{poll.question}</p>

        <h2>Options</h2>
        <ul className="poll-options">
          {poll.options?.map((option) => (
            <li key={option.id}>{option.text}</li>
          ))}
        </ul>
      </div>

      <div className="poll-results">
        <h2>Results</h2>
        <p>Total Responses: {totalVotes}</p>

        {totalVotes === 0 ? (
          <p>No responses yet.</p>
        ) : (
          results?.responsesByOption?.map((opt) => {
            const percent = totalVotes === 0 ? 0 : Math.round((opt.count / totalVotes) * 100)
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
    </main>
  )
}
