"use client"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"

export default function PollSuccessPage() {
  const params = useSearchParams()
  const pollId = params.get("id")
  const router = useRouter()

  return (
    <main className="container">
      <h1>✅ Poll Created Successfully!</h1>
      <Link href="/">🏠 Go Home</Link>
      <Link href={`/result/${pollId}`}>📊 View Result</Link>
    </main>
  )
}
