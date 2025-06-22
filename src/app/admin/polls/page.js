"use client"
import { useSearchParams } from "next/navigation"
import PollList from "@/components/polls/PollList"
import { Suspense } from "react"

function AdminPollsContent() {
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

export default function AdminPollsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminPollsContent />
    </Suspense>
  )
}
