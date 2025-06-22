"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import "./polls.css"

export default function PollList({ baseUrl, title, fetchUrl }) {
  const [polls, setPolls] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetch(fetchUrl)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`)
        }
        return res.json()
      })
      .then((data) => {
        // Handle the updated API response structure
        setPolls(data.polls || [])
        setPagination(data.pagination || null)
        setLoading(false)
      })
      .catch((error) => {
        console.error("Error fetching polls:", error)
        setError("Failed to load polls. Please try again later.")
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
      
      {error && <div className="error-alert">{error}</div>}
      
      {loading ? (
        <p>Loading polls...</p>
      ) : !polls || polls.length === 0 ? (
        <p>No polls found. Create one to get started.</p>
      ) : (
        <>
          <div className="poll-list">
            {polls.map((poll) => (
              <div key={poll.id} className="poll-card">
                <h3>{poll.title}</h3>
                <p>{poll.question}</p>
                {poll.creator && (
                  <p className="poll-creator">By: {poll.creator.name || poll.creator.email}</p>
                )}
                <div className="poll-status">
                  <span className={`status-indicator ${poll.isActive ? "active" : "inactive"}`}>
                    {poll.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="poll-actions">
                  <Link href={`${baseUrl}/${poll.id}`} className="btn-secondary">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
          
          {pagination && pagination.pages > 1 && (
            <div className="pagination">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                <Link 
                  key={page} 
                  href={`${baseUrl}?page=${page}`}
                  className={`pagination-link ${page === pagination.page ? 'active' : ''}`}
                >
                  {page}
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  )
}
