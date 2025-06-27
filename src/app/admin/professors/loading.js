import styles from "./professors.module.css"
import LoadingSpinner from "../../../components/LoadingSpinner"

// Pure Server Component for instant loading UI
export default function Loading() {
  return (
    <div className={styles.loadingContainer}>
      <LoadingSpinner size="large" />
      <p>Loading professors data...</p>
    </div>
  )
}
