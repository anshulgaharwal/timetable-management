import Image from "next/image"
import Link from "next/link"
import styles from "./page.module.css"

export default function Home() {
  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <h1>Timetable Management System</h1>
        <p>A modern solution for educational institutions to create, manage, and optimize academic schedules efficiently.</p>
        <div className={styles.ctas}>
          <Link href="/signin" className={styles.primary}>
            Get Started
          </Link>
          <Link href="/about" className={styles.secondary}>
            Learn More
          </Link>
        </div>
      </div>

      <div className={styles.main}>
        <div className={styles.card}>
          <div className={styles.icon}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
            </svg>
          </div>
          <h2>Smart Scheduling</h2>
          <p>Automatically generate conflict-free timetables that optimize resource utilization and accommodate constraints.</p>
          <Link href="/features/scheduling" className={styles.secondary}>
            Learn More
          </Link>
        </div>

        <div className={styles.card}>
          <div className={styles.icon}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1s-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-2 14l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
            </svg>
          </div>
          <h2>Resource Management</h2>
          <p>Efficiently manage classrooms, labs, faculty availability, and other resources to maximize utilization.</p>
          <Link href="/features/resources" className={styles.secondary}>
            Learn More
          </Link>
        </div>

        <div className={styles.card}>
          <div className={styles.icon}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92zM18 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM6 13c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm12 7.02c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" />
            </svg>
          </div>
          <h2>Seamless Collaboration</h2>
          <p>Enable administrators, faculty, and students to collaborate on schedule creation and management.</p>
          <Link href="/features/collaboration" className={styles.secondary}>
            Learn More
          </Link>
        </div>
      </div>

      {/* <footer className={styles.footer}>
        <Link href="/about">About</Link>
        <Link href="/contact">Contact</Link>
        <Link href="/privacy">Privacy Policy</Link>
        <Link href="/terms">Terms of Service</Link>
      </footer> */}
    </div>
  )
}
