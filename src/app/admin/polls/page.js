"use client"
import { useSearchParams } from "next/navigation"
import PollList from "@/components/polls/PollList"

export default function AdminPollsPage() {
  const searchParams = useSearchParams()
  const page = searchParams.get("page") || "1"
  const limit = searchParams.get("limit") || "10"
  
  return (
    <PollList 
      title="Poll Management" 
      baseUrl="/admin/polls" 
      fetchUrl={`/api/polls?page=${page}&limit=${limit}`} 
    />
  )
}
