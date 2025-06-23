"use client"

import { createContext, useContext, useState } from "react"

const AdminContext = createContext({
  actionButtons: [],
  setActionButtons: () => {},
  isLoading: false,
  setIsLoading: () => {},
})

export function AdminProvider({ children }) {
  const [actionButtons, setActionButtons] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  return (
    <AdminContext.Provider
      value={{
        actionButtons,
        setActionButtons,
        isLoading,
        setIsLoading,
      }}
    >
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  return useContext(AdminContext)
}
