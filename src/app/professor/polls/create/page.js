"use client"
import PollForm from "@/components/polls/PollForm"

export default function ProfessorCreatePollPage() {
  return <PollForm baseUrl="/professor/polls" isEdit={false} />
}
