'use client'
import { signIn } from 'next-auth/react'
import './style.css'

export default function SignInPage() {
  return (
    <div className="signin-bg">
      <img src="/giphy.gif" alt="bg gif" className="bg-gif" />
      <div className="signin-card">
        <img src="/IITILogo.png" alt="IIT Logo" className="signin-logo" />
        <h2 className="signin-title">Welcome to IIT Portal</h2>
        <button className="signin-button" onClick={() => signIn('google')}>
          Sign In with Google
        </button>
      </div>
    </div>
  )
}
