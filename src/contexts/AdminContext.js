"use client"

import { createContext, useContext, useState } from "react"

const AdminContext = createContext({
  // Admin-specific state can be added here in the future
  // For now, this context can be used for admin-only functionality
})

export function AdminProvider({ children }) {
  const [professors, setProfessors] = useState([])

  return (
    <AdminContext.Provider
      value={{
        professors,
        setProfessors,
        // Future admin-specific functionality can be added here
        // For example, managing batches, polls, settings, etc.
      }}
    >
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  return useContext(AdminContext)
}
