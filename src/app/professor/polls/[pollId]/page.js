"use client"
import { useParams } from "next/navigation"
import PollDetail from "@/components/polls/PollDetail"

export default function ProfessorPollDetailPage() {
  const { pollId } = useParams()

  return <PollDetail pollId={pollId} baseUrl="/professor/polls" />
}
