"use client"

import { useState, useEffect } from "react"
import { useAdmin } from "../../../contexts/AdminContext"
import styles from "./professors.module.css"
import ProfessorTable from "./components/ProfessorTable"
import ProfessorForm from "./components/ProfessorForm"
import Modal from "../../../components/Modal"

export default function ProfessorsPage() {
  const [professors, setProfessors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [currentProfessor, setCurrentProfessor] = useState(null)
  const [formData, setFormData] = useState({ name: "", email: "", password: "" })
  const { setActionButtons } = useAdmin()

  // Fetch professors data
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

  // Set up action buttons
  useEffect(() => {
    setActionButtons([
      {
        label: "Add New Professor",
        onClick: () => {
          setShowAddForm(true)
          setFormData({ name: "", email: "", password: "" })
        },
      },
    ])

    return () => setActionButtons([])
  }, [setActionButtons])

  // Handle professor operations
  const handleAddProfessor = async (e) => {
    if (e) e.preventDefault()
    try {
      setLoading(true)
      const res = await fetch("/api/professors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: "professor",
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || "Failed to add professor")
      }

      const data = await res.json()
      setProfessors([...professors, data.professor])
      setShowAddForm(false)
      setFormData({ name: "", email: "", password: "" })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEditProfessor = async (e) => {
    if (e) e.preventDefault()
    try {
      setLoading(true)
      const res = await fetch(`/api/professors/${currentProfessor.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          ...(formData.password && { password: formData.password }),
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || "Failed to update professor")
      }

      const updatedProfessor = await res.json()
      setProfessors(professors.map((p) => (p.id === currentProfessor.id ? updatedProfessor.professor : p)))
      setShowEditForm(false)
      setCurrentProfessor(null)
      setFormData({ name: "", email: "", password: "" })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProfessor = async (id) => {
    if (!confirm("Are you sure you want to delete this professor?")) return
    try {
      setLoading(true)
      const res = await fetch(`/api/professors/${id}`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error("Failed to delete professor")
      setProfessors(professors.filter((p) => p.id !== id))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const openEditModal = (professor) => {
    setCurrentProfessor(professor)
    setFormData({
      name: professor.name,
      email: professor.email,
      password: "", // Don't populate password for security
    })
    setShowEditForm(true)
  }

  return (
    <div className={styles.professorsContainer}>
      {error && <div className={styles.errorMessage}>{error}</div>}

      <ProfessorTable professors={professors} loading={loading} onEdit={openEditModal} onDelete={handleDeleteProfessor} />

      <Modal
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        title="Add New Professor"
        footerButtons={{
          cancel: {
            text: "Cancel",
            onClick: () => setShowAddForm(false),
          },
          confirm: {
            text: "Add Professor",
            onClick: handleAddProfessor,
          },
        }}
      >
        <ProfessorForm formData={formData} setFormData={setFormData} mode="add" />
      </Modal>

      <Modal
        isOpen={showEditForm}
        onClose={() => {
          setShowEditForm(false)
          setCurrentProfessor(null)
        }}
        title="Edit Professor"
        footerButtons={{
          cancel: {
            text: "Cancel",
            onClick: () => {
              setShowEditForm(false)
              setCurrentProfessor(null)
            },
          },
          confirm: {
            text: "Update Professor",
            onClick: handleEditProfessor,
          },
        }}
      >
        <ProfessorForm formData={formData} setFormData={setFormData} mode="edit" />
      </Modal>
    </div>
  )
}
