"use client"

import { useState } from "react"
import styles from "../professors.module.css"
import EditProfessorModal from "./EditProfessorModal"

export default function ProfessorRow({ professor, onDelete }) {
  const [showEditModal, setShowEditModal] = useState(false)

  return (
    <>
      <tr key={professor.id}>
        <td>{professor.name}</td>
        <td>{professor.email}</td>
        <td>
          <button className={`${styles.actionButton} ${styles.editButton}`} onClick={() => setShowEditModal(true)}>
            Edit
          </button>
          <button className={`${styles.actionButton} ${styles.deleteButton}`} onClick={() => onDelete(professor.id)}>
            Delete
          </button>
        </td>
      </tr>
      <EditProfessorModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} professor={professor} />
    </>
  )
}
