"use client"

import { useEffect } from "react"
import { signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import "../../styles/auth.css"

export default function SignOut() {
  const router = useRouter()

  useEffect(() => {
    signOut({ redirect: false }).then(() => {
      router.push("/signin?message=You have been successfully signed out.")
    })
  }, [router])

  return (
    <div className="auth-container">
      <h2>Signing you out...</h2>
      <p>Please wait while we redirect you.</p>
    </div>
  )
}
