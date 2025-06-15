"use client"
import { useParams } from "next/navigation"
import PollForm from "@/components/polls/PollForm"

export default function AdminEditPollPage() {
  const { pollId } = useParams()

  return <PollForm pollId={pollId} baseUrl="/admin/polls" isEdit={true} returnUrl={`/admin/polls/${pollId}`} />
}
