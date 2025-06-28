"use client"

import { createContext, useContext, useState } from "react"

const AdminContext = createContext({
  // Admin-specific state can be added here in the future
  // For now, this context can be used for admin-only functionality
})

export function AdminProvider({ children }) {
  // Remove global loading and action buttons - these are now in LayoutContext
  // Keep this context for future admin-specific state

  return (
    <AdminContext.Provider
      value={
        {
          // Future admin-specific functionality
        }
      }
    >
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  return useContext(AdminContext)
}
