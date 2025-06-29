"use client"

import LoadingSpinner from "../../../components/LoadingSpinner"
import styles from "./polls.module.css"

export default function Loading() {
  return (
    <div className={styles.loadingContainer}>
      <LoadingSpinner size="large" />
      <p>Loading polls...</p>
    </div>
  )
}
