"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import "../../styles/auth.css"

export default function SigninForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState("")
  const [form, setForm] = useState({ email: "", password: "" })

  useEffect(() => {
    const errorParam = searchParams.get("error")
    if (errorParam) setError("Invalid email or password")
  }, [searchParams])

  const handleSubmit = async (e) => {
    e.preventDefault()

    const res = await signIn("credentials", {
      redirect: false,
      email: form.email,
      password: form.password,
    })

    if (res?.ok) {
      router.refresh()
      router.push("/")
    } else {
      setError("Invalid email or password")
    }
  }

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit}>
        <h2>Sign In</h2>
        {error && <p className="text-red-500">{error}</p>}
        <input type="email" placeholder="Email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input type="password" placeholder="Password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <button type="submit">Sign In</button>
        <p>
          Don't have an account? <a href="/signup">Sign Up</a>
        </p>
        <button type="button" className="google-btn" onClick={() => signIn("google")}>
          <img src="/google-logo.png" alt="Google" /> Sign in with Google
        </button>
      </form>
    </div>
  )
}
