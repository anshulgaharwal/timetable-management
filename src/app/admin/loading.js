"use client"

import { useEffect } from "react"
import LoadingSpinner from "../../components/LoadingSpinner"
import styles from "./admin.module.css"

export default function Loading() {
  // Ensure the component unmounts properly
  useEffect(() => {
    return () => {
      // Cleanup when component unmounts
    }
  }, [])

  return (
    <div className={styles.loadingContainer}>
      <LoadingSpinner size="large" />
      <p>Loading content...</p>
    </div>
  )
}
