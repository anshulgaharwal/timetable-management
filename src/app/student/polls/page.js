"use client"

import { useState, useEffect, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useLayout } from "../../../contexts/LayoutContext"
import LoadingSpinner from "../../../components/LoadingSpinner"
import styles from "./polls.module.css"

export default function StudentPolls() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const { setActionButtons } = useLayout()

  const [polls, setPolls] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState("active") // active, all, completed
  const [searchTerm, setSearchTerm] = useState("")

  // Protect route from unauthorized roles
  useEffect(() => {
    if (status === "authenticated") {
      if (!session) return
      if (session.user.role.toLowerCase() !== "student") {
        router.replace("/unauthorized")
        return
      }
    } else if (status === "unauthenticated") {
      router.replace("/signin")
      return
    }
  }, [status, session, router])

  useEffect(() => {
    if (status !== "authenticated" || !session) return

    // Set action buttons
    setActionButtons([
      {
        label: "Refresh Polls",
        icon: "🔄",
        onClick: () => fetchPolls(),
        variant: "secondary",
      },
    ])

    // Fetch polls
    fetchPolls()

    return () => {
      setActionButtons([])
    }
  }, [status, session])

  const fetchPolls = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/polls?limit=50")
      if (!response.ok) {
        throw new Error("Failed to fetch polls")
      }

      const data = await response.json()
      setPolls(data.polls || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePollClick = (pollId) => {
    startTransition(() => {
      router.push(`/student/polls/respond/${pollId}`)
    })
  }

  const getFilteredPolls = () => {
    let filtered = polls

    // Filter by status
    if (filter === "active") {
      filtered = filtered.filter((poll) => poll.isActive && (!poll.expiresAt || new Date(poll.expiresAt) > new Date()))
    } else if (filter === "completed") {
      filtered = filtered.filter((poll) => !poll.isActive || (poll.expiresAt && new Date(poll.expiresAt) <= new Date()))
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((poll) => poll.title.toLowerCase().includes(searchTerm.toLowerCase()) || poll.question.toLowerCase().includes(searchTerm.toLowerCase()) || poll.category?.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    return filtered
  }

  const getPollStatus = (poll) => {
    if (!poll.isActive) return { status: "closed", label: "Closed", color: "#6b7280" }
    if (poll.expiresAt && new Date(poll.expiresAt) <= new Date()) {
      return { status: "expired", label: "Expired", color: "#dc2626" }
    }
    return { status: "active", label: "Active", color: "#059669" }
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
  if (status === "loading" || !session) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner size="large" />
        <p>Loading...</p>
      </div>
    )
  }

  const filteredPolls = getFilteredPolls()

  return (
    <div className={styles.pollsContainer}>
      {error && <div className={styles.errorMessage}>{error}</div>}

      <div className={styles.pollsHeader}>
        {/* <div className={styles.headerContent}>
          <h1 className={styles.pageTitle}>Available Polls</h1>
          <p className={styles.pageSubtitle}>Participate in polls and share your feedback</p>
        </div> */}

        <div className={styles.controls}>
          {/* <div className={styles.searchContainer}>
            <input type="text" placeholder="Search polls..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={styles.searchInput} />
            <span className={styles.searchIcon}>🔍</span>
          </div> */}

          <div className={styles.filterTabs}>
            <button className={`${styles.filterTab} ${filter === "active" ? styles.active : ""}`} onClick={() => setFilter("active")}>
              Active ({polls.filter((p) => p.isActive && (!p.expiresAt || new Date(p.expiresAt) > new Date())).length})
            </button>
            <button className={`${styles.filterTab} ${filter === "all" ? styles.active : ""}`} onClick={() => setFilter("all")}>
              All ({polls.length})
            </button>
            <button className={`${styles.filterTab} ${filter === "completed" ? styles.active : ""}`} onClick={() => setFilter("completed")}>
              Completed ({polls.filter((p) => !p.isActive || (p.expiresAt && new Date(p.expiresAt) <= new Date())).length})
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className={styles.loadingContainer}>
          <LoadingSpinner size="medium" />
          <p>Loading polls...</p>
        </div>
      ) : filteredPolls.length === 0 ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>📊</span>
          <h3>No polls found</h3>
          <p>{filter === "active" ? "There are no active polls at the moment. Check back later!" : searchTerm ? `No polls match your search "${searchTerm}"` : "No polls available"}</p>
        </div>
      ) : (
        <div className={styles.pollsList}>
          {filteredPolls.map((poll) => {
            const pollStatus = getPollStatus(poll)
            const categoryIcon = getCategoryIcon(poll.category)

            return (
              <div key={poll.id} className={`${styles.pollCard} ${pollStatus.status === "active" ? styles.clickable : styles.disabled}`} onClick={() => pollStatus.status === "active" && handlePollClick(poll.id)}>
                <div className={styles.pollHeader}>
                  <div className={styles.pollMeta}>
                    <span className={styles.categoryIcon}>{categoryIcon}</span>
                    <span className={styles.category}>{poll.category || "General"}</span>
                    <span className={styles.status} style={{ backgroundColor: pollStatus.color }}>
                      {pollStatus.label}
                    </span>
                  </div>
                  <div className={styles.responseCount}>{poll._count?.responses || 0} responses</div>
                </div>

                <div className={styles.pollContent}>
                  <h3 className={styles.pollTitle}>{poll.title}</h3>
                  <p className={styles.pollQuestion}>{poll.question}</p>

                  {poll.description && <p className={styles.pollDescription}>{poll.description}</p>}
                </div>

                <div className={styles.pollFooter}>
                  <div className={styles.pollInfo}>
                    <span className={styles.creator}>By {poll.creator?.name || "Unknown"}</span>
                    <span className={styles.expiry}>{poll.expiresAt ? `Expires: ${formatDate(poll.expiresAt)}` : "No expiry"}</span>
                  </div>

                  {pollStatus.status === "active" && (
                    <div className={styles.participateButton}>
                      <span>Participate →</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
