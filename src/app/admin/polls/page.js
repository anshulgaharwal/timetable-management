"use client"
import PollList from "@/components/polls/PollList"

export default function AdminPollsPage() {
  return <PollList title="Poll Management" baseUrl="/admin/polls" fetchUrl="/api/polls" />
}
