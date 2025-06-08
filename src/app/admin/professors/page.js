"use client"
import { useState, useEffect, useMemo } from "react"
import DashboardLayout from "../../../components/DashboardLayout"
import { useSession } from "next-auth/react"
import "../../../styles/professors.css"

export default function ProfessorsPage() {
  const { data: session } = useSession()
  const [professors, setProfessors] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [currentProfessor, setCurrentProfessor] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  })

  const sidebarTabs = [
    { label: "Dashboard", href: "/admin" },
    // { label: "Manage Users", href: "/admin/users" },
    { label: "Professors", href: "/admin/professors" },
    // { label: "System Settings", href: "/admin/settings" },
  ]

  // Use useMemo to recreate actionButtons when showAddForm changes
  const actionButtons = useMemo(
    () => [
      {
        label: showAddForm ? "Cancel" : "Add New Professor",
        onClick: () => {
          setShowAddForm(!showAddForm)
          setShowEditForm(false)
          setFormData({ name: "", email: "", password: "" })
        },
      },
    ],
    [showAddForm]
  )

  // Fetch professors
  useEffect(() => {
    fetchProfessors()
  }, [])

  const fetchProfessors = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/professors")
      if (!response.ok) {
        throw new Error("Failed to fetch professors")
      }
      const data = await response.json()
      setProfessors(data)
    } catch (err) {
      setError("Error fetching professors: " + err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleAddProfessor = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/professors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: "professor",
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to add professor")
      }

      // Reset form and refresh professors list
      setFormData({ name: "", email: "", password: "" })
      setShowAddForm(false)
      fetchProfessors()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleEditProfessor = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch(`/api/professors/${currentProfessor.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          ...(formData.password && { password: formData.password }),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update professor")
      }

      // Reset form and refresh professors list
      setFormData({ name: "", email: "", password: "" })
      setShowEditForm(false)
      setCurrentProfessor(null)
      fetchProfessors()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDeleteProfessor = async (id) => {
    if (window.confirm("Are you sure you want to delete this professor?")) {
      try {
        const response = await fetch(`/api/professors/${id}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || "Failed to delete professor")
        }

        fetchProfessors()
      } catch (err) {
        setError(err.message)
      }
    }
  }

  const openEditForm = (professor) => {
    setCurrentProfessor(professor)
    setFormData({
      name: professor.name,
      email: professor.email,
      password: "", // Don't populate password for security
    })
    setShowEditForm(true)
    setShowAddForm(false)
  }

  return (
    <DashboardLayout sidebarTabs={sidebarTabs} pageTitle="Manage Professors" actionButtons={actionButtons}>
      <div className="professors-container">
        <h1>Manage Professors</h1>

        {error && <div className="error-message">{error}</div>}

        {showAddForm && (
          <div className="form-container">
            <h2>Add New Professor</h2>
            <form onSubmit={handleAddProfessor}>
              <div className="form-group">
                <label>Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" name="password" value={formData.password} onChange={handleInputChange} required />
              </div>
              <button type="submit" className="submit-button">
                Add Professor
              </button>
            </form>
          </div>
        )}

        {showEditForm && (
          <div className="form-container">
            <h2>Edit Professor</h2>
            <form onSubmit={handleEditProfessor}>
              <div className="form-group">
                <label>Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Password (Leave blank to keep current)</label>
                <input type="password" name="password" value={formData.password} onChange={handleInputChange} />
              </div>
              <button type="submit" className="submit-button">
                Update Professor
              </button>
              <button
                type="button"
                className="cancel-button"
                onClick={() => {
                  setShowEditForm(false)
                  setCurrentProfessor(null)
                }}
              >
                Cancel
              </button>
            </form>
          </div>
        )}

        {isLoading ? (
          <p>Loading professors...</p>
        ) : (
          <div className="professors-list">
            <h2>All Professors</h2>
            {professors.length === 0 ? (
              <p>No professors found.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {professors.map((professor) => (
                    <tr key={professor.id}>
                      <td>{professor.name}</td>
                      <td>{professor.email}</td>
                      <td className="actions-cell">
                        <button className="edit-button" onClick={() => openEditForm(professor)}>
                          Edit
                        </button>
                        <button className="delete-button" onClick={() => handleDeleteProfessor(professor.id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
