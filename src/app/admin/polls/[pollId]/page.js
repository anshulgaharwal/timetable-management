"use client"
import { useParams } from "next/navigation"
import PollDetail from "@/components/polls/PollDetail"

export default function AdminPollDetailPage() {
  const { pollId } = useParams()

  return <PollDetail pollId={pollId} baseUrl="/admin/polls" />
}
