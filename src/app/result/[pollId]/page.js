"use client"
import "./resultId.css"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"

export default function PollResultPage() {
  const { pollId } = useParams()
  const [result, setResult] = useState(null)

  useEffect(() => {
    fetch(`/api/result/${pollId}`)
      .then((res) => res.json())
      .then((data) => setResult(data))
  }, [pollId])

  if (!result) return <main className="container">Loading...</main>

  const { poll, responsesByOption } = result
  const totalVotes = responsesByOption.reduce((sum, opt) => sum + opt.count, 0)

  return (
    <main className="container">
      <h1>{poll.title}</h1>
      <p>{poll.question}</p>
      <h2>📊 Results</h2>
      <p>Total Responses: {totalVotes}</p>
      <ul>
        {responsesByOption.map((opt) => {
          const percent = totalVotes === 0 ? 0 : Math.round((opt.count / totalVotes) * 100)
          return (
            <li key={opt.optionId}>
              {opt.text}: {opt.count} votes ({percent}%)
            </li>
          )
        })}
      </ul>
      <br />
      <Link href="/">🏠 Go Home</Link>
    </main>
  )
}
