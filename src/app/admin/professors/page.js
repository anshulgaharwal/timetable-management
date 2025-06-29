"use client"

import { useState, useEffect } from "react"
import { useLayout } from "../../../contexts/LayoutContext"
import styles from "./professors.module.css"
import ProfessorRow from "./components/ProfessorTableRow"
import { useAdmin } from "../../../contexts/AdminContext"
import AddProfessorModal from "./components/AddProfessorModal"
import LoadingSpinner from "@/components/LoadingSpinner"
import { deleteProfessor } from "@/lib/adminApi"

export default function ProfessorsPage() {
  const { professors, setProfessors } = useAdmin()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const { setActionButtons } = useLayout()

  const handleDelete = async (id) => {
    // confirm delete
    if (!confirm("Are you sure you want to delete this professor?")) return
    try {
      const res = await deleteProfessor(id)
      if (!res.success) throw new Error("Failed to delete professor")
      setProfessors(professors.filter((p) => p.id !== id))
    } catch (error) {
      console.error("Error deleting professor:", error)
    }
  }

  useEffect(() => {
    const fetchProfessors = async () => {
      try {
        const res = await fetch("/api/professors")
        if (!res.ok) throw new Error("Failed to fetch professors")
        const data = await res.json()
        setProfessors(data || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProfessors()
  }, [])

  useEffect(() => {
    setActionButtons([
      {
        label: "Add Professor",
        icon: "➕",
        onClick: () => {
          setShowAddForm(true)
        },
        variant: "primary",
      },
    ])

    return () => setActionButtons([])
  }, [setActionButtons])

  return (
    <>
      {error && <div className={styles.errorMessage}>{error}</div>}

      {professors.length > 0 && !loading && professors.map((professor) => <ProfessorRow key={professor.id} professor={professor} onDelete={handleDelete} />)}

      {professors.length === 0 && !loading && <div className={styles.emptyMessage}>No professors found</div>}
      {loading && professors.length === 0 && (
        <div className={styles.loadingContainer}>
          <LoadingSpinner size="large" />
          <p>Loading...</p>
        </div>
      )}
      <AddProfessorModal isOpen={showAddForm} onClose={() => setShowAddForm(false)} />
    </>
  )
}
