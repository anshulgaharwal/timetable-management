'use client'
import { signIn } from 'next-auth/react'

export default function SignInPage() {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h2>Sign In</h2>
      <button onClick={() => signIn('google')}>Sign In with Google</button>
    </div>
  )
}
