"use client"
import { useParams } from "next/navigation"
import PollForm from "@/components/polls/PollForm"

export default function ProfessorEditPollPage() {
  const { pollId } = useParams()

  return <PollForm pollId={pollId} baseUrl="/professor/polls" isEdit={true} returnUrl={`/professor/polls/${pollId}`} />
}
