"use client"
import "./polls.css"
import { useEffect, useState } from "react"
import Link from "next/link"

export default function AdminPollsPage() {
  const [polls, setPolls] = useState([])

  useEffect(() => {
    fetch("/api/polls")
      .then((res) => res.json())
      .then((data) => setPolls(data.polls))
  }, [])

  return (
    <main className="container">
      <h1>Poll Management</h1>
      <div className="actions-container">
        <Link href="/admin/polls/create" className="btn-primary">
          Create New Poll
        </Link>
      </div>

      <h2>All Polls</h2>
      {polls.length === 0 ? (
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
                <Link href={`/admin/polls/${poll.id}`} className="btn-secondary">
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
