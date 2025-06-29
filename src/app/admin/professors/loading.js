"use client"

import LoadingSpinner from "../../../components/LoadingSpinner"
import styles from "./professors.module.css"

export default function Loading() {
  return (
    <div className={styles.loadingContainer}>
      <LoadingSpinner size="large" />
      <p>Loading...</p>
    </div>
  )
}
