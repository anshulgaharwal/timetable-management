"use client"
import { useRouter } from "next/navigation"
import styles from "./success.module.css"

export default function RespondSuccess() {
  const router = useRouter()

  const goToPolls = () => {
    router.push("/student/polls")
  }

  const goHome = () => {
    router.push("/student")
  }

  return (
    <div className={styles.container}>
      <div className={styles.successContent}>
        <div className={styles.successIcon}>✅</div>
        <h1>Response Submitted Successfully!</h1>
        <p>Thank you for participating in the poll. Your response has been recorded.</p>

        <div className={styles.actionButtons}>
          <button onClick={goToPolls} className={styles.primaryButton}>
            View More Polls
          </button>
          <button onClick={goHome} className={styles.secondaryButton}>
            Go to Dashboard
          </button>
        </div>

        <div className={styles.links}>
          <button onClick={goToPolls} className={styles.link}>
            🗳️ Browse all polls
          </button>
          <button onClick={() => router.push("/result")} className={styles.link}>
            📊 View poll results
          </button>
        </div>
      </div>
    </div>
  )
}
