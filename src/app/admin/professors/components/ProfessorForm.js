"use client"

import styles from "../professors.module.css"

export default function ProfessorForm({ formData, setFormData, mode }) {
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div className={styles.formContainer}>
      <div className={styles.formGroup}>
        <label htmlFor="name">Full Name</label>
        <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Enter professor's full name" required />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="email">Email</label>
        <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter professor's email address" required />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="password">{mode === "add" ? "Password" : "New Password (leave blank to keep current)"}</label>
        <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} placeholder={mode === "add" ? "Enter password" : "Enter new password"} required={mode === "add"} />
      </div>
    </div>
  )
}
