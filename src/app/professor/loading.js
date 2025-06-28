"use client"

import LoadingSpinner from "../../components/LoadingSpinner"
import styles from "./professor.module.css"

export default function Loading() {
  return (
    <div className={styles.loadingContainer}>
      <LoadingSpinner size="large" />
      <p>Loading professor dashboard...</p>
    </div>
  )
}
