'use client'
import { useSession } from 'next-auth/react'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RedirectPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'authenticated') {
      const role = session.user.role
      if (role === 'admin') router.push('/admin')
      else if (role === 'professor') router.push('/professor')
      else router.push('/student')
    }
  }, [status])

  return <p>Redirecting...</p>
}
