"use client"
import "../../polls.css"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"

export default function EditPollPage() {
  const { pollId } = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState("")
  const [question, setQuestion] = useState("")
  const [options, setOptions] = useState([])
  const [originalOptions, setOriginalOptions] = useState([])

  useEffect(() => {
    const fetchPoll = async () => {
      try {
        const res = await fetch(`/api/polls/${pollId}`)
        const data = await res.json()

        setTitle(data.poll.title)
        setQuestion(data.poll.question)

        // Convert options from the API format to the format needed for editing
        const pollOptions = data.poll.options.map((opt) => opt.text)
        setOptions(pollOptions)
        setOriginalOptions(data.poll.options)

        setLoading(false)
      } catch (error) {
        console.error("Error fetching poll:", error)
        setLoading(false)
      }
    }

    fetchPoll()
  }, [pollId])

  const addOption = () => setOptions([...options, ""])

  const removeOption = (index) => {
    const newOptions = [...options]
    newOptions.splice(index, 1)
    setOptions(newOptions)
  }

  const handleOptionChange = (value, index) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Make sure we have at least 2 options
    if (options.length < 2 || options.some((opt) => opt.trim() === "")) {
      alert("Please provide at least 2 non-empty options")
      return
    }

    try {
      const res = await fetch(`/api/polls/${pollId}`, {
        method: "PUT",
        body: JSON.stringify({
          title,
          question,
          options,
          originalOptions,
        }),
        headers: { "Content-Type": "application/json" },
      })

      if (res.ok) {
        router.push(`/professor/polls/${pollId}`)
      } else {
        alert("Error updating poll")
      }
    } catch (error) {
      console.error("Error updating poll:", error)
      alert("An error occurred while updating the poll")
    }
  }

  if (loading) {
    return (
      <main className="container">
        <div className="actions-container">
          <Link href={`/professor/polls/${pollId}`} className="btn-secondary">
            ← Back to Poll
          </Link>
        </div>
        <p>Loading poll data...</p>
      </main>
    )
  }

  return (
    <main className="container">
      <div className="actions-container">
        <Link href={`/professor/polls/${pollId}`} className="btn-secondary">
          ← Back to Poll
        </Link>
      </div>

      <h1>Edit Poll</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Poll Title" value={title} onChange={(e) => setTitle(e.target.value)} required />

        <textarea placeholder="Poll Question" value={question} onChange={(e) => setQuestion(e.target.value)} required />

        <h3>Options:</h3>
        {options.map((opt, i) => (
          <div className="option-row" key={i}>
            <input type="text" placeholder={`Option ${i + 1}`} value={opt} onChange={(e) => handleOptionChange(e.target.value, i)} required />
            {options.length > 2 && (
              <button type="button" onClick={() => removeOption(i)}>
                ✖
              </button>
            )}
          </div>
        ))}

        <button type="button" onClick={addOption} className="add-button">
          Add Option
        </button>

        <button type="submit" className="submit-button">
          Update Poll
        </button>
      </form>
    </main>
  )
}
