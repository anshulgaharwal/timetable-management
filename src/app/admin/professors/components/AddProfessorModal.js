import { useState } from "react"
import Modal from "../../../../components/Modal"
import ProfessorForm from "./ProfessorForm"
import { addProfessor } from "@/lib/adminApi"
import { useAdmin } from "../../../../contexts/AdminContext"

export default function AddProfessorModal({ isOpen, onClose }) {
  const { professors, setProfessors } = useAdmin()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [submitLoading, setSubmitLoading] = useState(false)

  // Handle professor operations
  const handleAddProfessor = async (e) => {
    if (e) e.preventDefault()
    if (!formData.name || !formData.email || !formData.password) {
      setError("All fields are required")
      return
    }
    setSubmitLoading(true)
    setError("")
    try {
      const data = await addProfessor(formData)
      setProfessors([...professors, data.professor])
      setShowAddForm(false)
      setFormData({ name: "", email: "", password: "" })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitLoading(false)
    }
  }
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Professor"
      footerButtons={{
        cancel: {
          text: "Cancel",
          onClick: onClose,
        },
        confirm: {
          text: submitLoading ? "Adding..." : "Add Professor",
          onClick: handleAddProfessor,
          disabled: submitLoading,
        },
      }}
    >
      {/* error */}
      {error && <p className="text-red-500">{error}</p>}

      {/* form */}
      <ProfessorForm formData={formData} setFormData={setFormData} mode="add" />
    </Modal>
  )
}
