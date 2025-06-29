"use client"

import LoadingSpinner from "../../../../../components/LoadingSpinner"
import styles from "./respond.module.css"

export default function Loading() {
  return (
    <div className={styles.loadingContainer}>
      <LoadingSpinner size="large" />
      <p>Loading poll response...</p>
    </div>
  )
}
