"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import "./polls.css"

export default function PollList({ baseUrl, title, fetchUrl }) {
  const [polls, setPolls] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(fetchUrl)
      .then((res) => res.json())
      .then((data) => {
        setPolls(data.polls)
        setLoading(false)
      })
      .catch((error) => {
        console.error("Error fetching polls:", error)
        setLoading(false)
      })
  }, [fetchUrl])

  return (
    <main className="container">
      <h1>{title}</h1>
      <div className="actions-container">
        <Link href={`${baseUrl}/create`} className="btn-primary">
          Create New Poll
        </Link>
      </div>

      <h2>All Polls</h2>
      {loading ? (
        <p>Loading polls...</p>
      ) : polls.length === 0 ? (
        <p>No polls found. Create one to get started.</p>
      ) : (
        <div className="poll-list">
          {polls.map((poll) => (
            <div key={poll.id} className="poll-card">
              <h3>{poll.title}</h3>
              <p>{poll.question}</p>
              <div className="poll-status">
                <span className={`status-indicator ${poll.isActive ? "active" : "inactive"}`}>{poll.isActive ? "Active" : "Inactive"}</span>
              </div>
              <div className="poll-actions">
                <Link href={`${baseUrl}/${poll.id}`} className="btn-secondary">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
