"use client"
import PollForm from "@/components/polls/PollForm"

export default function AdminCreatePollPage() {
  return <PollForm baseUrl="/admin/polls" isEdit={false} />
}
