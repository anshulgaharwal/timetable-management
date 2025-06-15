"use client"
import PollList from "@/components/polls/PollList"

export default function ProfessorPollsPage() {
  return <PollList title="My Polls" baseUrl="/professor/polls" fetchUrl="/api/professor/polls" />
}
