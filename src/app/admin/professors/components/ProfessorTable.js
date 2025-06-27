"use client"

import styles from "../professors.module.css"

export default function ProfessorTable({ professors, loading, onEdit, onDelete }) {
  if (loading) {
    return (
      <div className={styles.tableContainer}>
        <table className={styles.professorsTable}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map((index) => (
              <tr key={`skeleton-${index}`}>
                <td>
                  <div className={styles.skeleton}></div>
                </td>
                <td>
                  <div className={styles.skeleton}></div>
                </td>
                <td>
                  <div className={styles.skeleton}></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (!professors || professors.length === 0) {
    return <div className={styles.emptyMessage}>No professors found</div>
  }

  return (
    <div className={styles.tableContainer}>
      <table className={styles.professorsTable}>
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
              <td className={styles.actionsCell}>
                <button className={`${styles.actionButton} ${styles.editButton}`} onClick={() => onEdit(professor)}>
                  Edit
                </button>
                <button className={`${styles.actionButton} ${styles.deleteButton}`} onClick={() => onDelete(professor.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
