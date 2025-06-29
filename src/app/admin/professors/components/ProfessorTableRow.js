"use client"

import { useState } from "react"
import styles from "../professors.module.css"
import EditProfessorModal from "./EditProfessorModal"
import { deleteProfessor } from "@/lib/adminApi"

export default function ProfessorRow({ professor }) {
  const [showEditModal, setShowEditModal] = useState(false)

  const handleDelete = async () => {
    try {
      const res = await deleteProfessor(professor.id)
      if (!res.ok) throw new Error("Failed to delete professor")
    } catch (error) {
      console.error("Error deleting professor:", error)
    }
  }

  return (
    <>
      <tr key={professor.id}>
        <td>{professor.name}</td>
        <td>{professor.email}</td>
        <td>
          <button className={`${styles.actionButton} ${styles.editButton}`} onClick={() => setShowEditModal(true)}>
            Edit
          </button>
          <button className={`${styles.actionButton} ${styles.deleteButton}`} onClick={handleDelete}>
            Delete
          </button>
        </td>
      </tr>
      <EditProfessorModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} professor={professor} />
    </>
  )
}
