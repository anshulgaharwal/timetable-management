"use client"

import { createContext, useContext, useState } from "react"

const StudentContext = createContext({
  // Student-specific state can be added here in the future
  // For now, this context can be used for student-only functionality
})

export function StudentProvider({ children }) {
  // Remove global loading and action buttons - these are now in LayoutContext
  // Keep this context for future student-specific state

  return (
    <StudentContext.Provider
      value={
        {
          // Future student-specific functionality
        }
      }
    >
      {children}
    </StudentContext.Provider>
  )
}

export function useStudent() {
  return useContext(StudentContext)
}
