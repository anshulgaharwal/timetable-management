"use client"

import { SessionProvider } from "next-auth/react"
import { LayoutProvider } from "../contexts/LayoutContext"

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <LayoutProvider>{children}</LayoutProvider>
    </SessionProvider>
  )
}
