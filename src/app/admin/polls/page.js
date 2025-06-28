"use client"

import { useState, useEffect, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useLayout } from "../../../contexts/LayoutContext"
import LoadingSpinner from "../../../components/LoadingSpinner"
import Modal from "../../../components/Modal"
import Link from "next/link"
import { Suspense } from "react"
import styles from "./polls.module.css"

function AdminPollsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const { setActionButtons } = useLayout()

  const [polls, setPolls] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [pollToDelete, setPollToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [viewMode, setViewMode] = useState("grid") // grid or list

  const page = searchParams.get("page") || "1"
  const limit = searchParams.get("limit") || "10"

  useEffect(() => {
    // Set action buttons immediately
    setActionButtons([
      {
        label: "Create Poll",
        icon: "➕",
        onClick: () => {
          startTransition(() => {
            router.push("/admin/polls/create")
          })
        },
        variant: "primary",
      },
      {
        label: viewMode === "grid" ? "List View" : "Grid View",
        icon: viewMode === "grid" ? "📋" : "⊞",
        onClick: () => setViewMode(viewMode === "grid" ? "list" : "grid"),
        variant: "secondary",
      },
    ])

    // Fetch polls immediately
    fetchPolls()

    return () => {
      setActionButtons([])
    }
  }, [page, limit, viewMode])

  const fetchPolls = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`/api/polls?page=${page}&limit=${limit}`)
      if (!res.ok) {
        throw new Error("Failed to fetch polls")
      }
      const data = await res.json()
      setPolls(data.polls || [])
      setPagination(data.pagination || null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePoll = async () => {
    if (!pollToDelete) return

    setIsDeleting(true)
    setError(null)

    try {
      const res = await fetch(`/api/polls/${pollToDelete.id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        throw new Error("Failed to delete poll")
      }

      // Remove the deleted poll from state
      setPolls(polls.filter((poll) => poll.id !== pollToDelete.id))
      setShowDeleteModal(false)
      setPollToDelete(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsDeleting(false)
    }
  }

  const openDeleteModal = (poll) => {
    setPollToDelete(poll)
    setShowDeleteModal(true)
    setError(null)
  }

  const navigateToPoll = (pollId) => {
    startTransition(() => {
      router.push(`/admin/polls/${pollId}`)
    })
  }

  const navigateToEdit = (pollId) => {
    startTransition(() => {
      router.push(`/admin/polls/edit/${pollId}`)
    })
  }

  const changePage = (newPage) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams)
      params.set("page", newPage.toString())
      router.push(`/admin/polls?${params.toString()}`)
    })
  }

  return (
    <div className={styles.pollsContainer}>
      {error && <div className={styles.errorMessage}>{error}</div>}

      {loading ? (
        <div className={styles.loadingContainer}>
          <LoadingSpinner size="large" />
          <p>Loading polls...</p>
        </div>
      ) : polls.length === 0 ? (
        <div className={styles.emptyState}>
          <h3>No polls found</h3>
          <p>Create your first poll to get started</p>
          <button 
            className={styles.createButton} 
            onClick={() => router.push("/admin/polls/create")}
          >
            Create Poll
          </button>
        </div>
      ) : (
        <>
          <div className={styles.pollsHeader}>
            <h2>Poll Management</h2>
            <p>Create and manage polls for student feedback and voting</p>
          </div>

          {viewMode === "grid" ? (
            <div className={styles.pollGrid}>
              {polls.map((poll) => (
                <div key={poll.id} className={styles.pollCard} onClick={() => navigateToPoll(poll.id)}>
                  <div className={styles.pollCardHeader}>
                    <h4>{poll.title}</h4>
                    <span className={`${styles.statusBadge} ${poll.isActive ? styles.active : styles.inactive}`}>
                      {poll.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className={styles.pollCardBody}>
                    <p className={styles.pollQuestion}>{poll.question}</p>
                    {poll.creator && (
                      <div className={styles.pollMeta}>
                        <span className={styles.metaLabel}>By:</span>
                        <span>{poll.creator.name || poll.creator.email}</span>
                      </div>
                    )}
                    {poll.category && (
                      <div className={styles.pollCategory}>{poll.category}</div>
                    )}
                    <div className={styles.pollCardActions}>
                      <button
                        className={styles.viewButton}
                        onClick={(e) => {
                          e.stopPropagation()
                          navigateToPoll(poll.id)
                        }}
                      >
                        View Details
                      </button>
                      <button
                        className={styles.editButton}
                        onClick={(e) => {
                          e.stopPropagation()
                          navigateToEdit(poll.id)
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className={styles.deleteButton}
                        onClick={(e) => {
                          e.stopPropagation()
                          openDeleteModal(poll)
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.pollTable}>
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Question</th>
                    <th>Status</th>
                    <th>Creator</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {polls.map((poll) => (
                    <tr key={poll.id}>
                      <td>{poll.title}</td>
                      <td className={styles.questionCell}>
                        {poll.question.length > 50 
                          ? `${poll.question.substring(0, 50)}...` 
                          : poll.question
                        }
                      </td>
                      <td>
                        <span className={`${styles.statusBadge} ${poll.isActive ? styles.active : styles.inactive}`}>
                          {poll.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>{poll.creator?.name || poll.creator?.email || "Unknown"}</td>
                      <td className={styles.tableActions}>
                        <button className={styles.viewButton} onClick={() => navigateToPoll(poll.id)}>
                          View
                        </button>
                        <button className={styles.editButton} onClick={() => navigateToEdit(poll.id)}>
                          Edit
                        </button>
                        <button className={styles.deleteButton} onClick={() => openDeleteModal(poll)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className={styles.pagination}>
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  className={`${styles.paginationButton} ${pageNum === pagination.page ? styles.active : ""}`}
                  onClick={() => changePage(pageNum)}
                >
                  {pageNum}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* Delete Poll Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setPollToDelete(null)
          setError(null)
        }}
        title="Confirm Deletion"
        size="small"
        footerButtons={{
          cancel: {
            text: "Cancel",
            onClick: () => {
              setShowDeleteModal(false)
              setPollToDelete(null)
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
          Are you sure you want to delete the poll <strong>{pollToDelete?.title}</strong>? 
          This action cannot be undone and will remove all associated responses.
        </p>
      </Modal>
    </div>
  )
}

export default function AdminPollsPage() {
  return (
    <Suspense fallback={
      <div className={styles.loadingContainer}>
        <LoadingSpinner size="large" />
        <p>Loading polls...</p>
      </div>
    }>
      <AdminPollsContent />
    </Suspense>
  )
}
