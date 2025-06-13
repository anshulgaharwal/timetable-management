"use client"
import "./success.css"
import Link from "next/link"

export default function RespondSuccess() {
  return (
    <main className="container">
      <h1>✅ You have successfully participated in the poll!</h1>
      <Link href="/">🏠 Go Home</Link>
    </main>
  )
}
