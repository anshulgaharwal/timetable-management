import styles from "./professors.module.css"

export default function ProfessorsLayout({ children }) {
  return (
    <div className={styles.professorsContainer}>
      <div className={styles.tableContainer}>
        <table className={styles.professorsTable}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </div>
  )
}
