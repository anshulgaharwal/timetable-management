"use client"

import { useState, useEffect, useRef } from "react"
import styles from "./LoadingSpinner.module.css"

export default function LoadingSpinner({ size = "medium", fullPage = false }) {
  // Add a small delay before showing the spinner to avoid flashing
  const [show, setShow] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    // Set a new timer
    timerRef.current = setTimeout(() => {
      setShow(true)
    }, 150)

    // Cleanup function
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  if (!show) return null

  const sizeClass = styles[size] || styles.medium

  if (fullPage) {
    return (
      <div className={styles.fullPageContainer}>
        <div className={`${styles.spinner} ${sizeClass}`}></div>
      </div>
    )
  }

  return <div className={`${styles.spinner} ${sizeClass}`}></div>
}
