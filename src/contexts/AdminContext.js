"use client"

import { createContext, useContext, useState } from "react"

const AdminContext = createContext({
  actionButtons: [],
  setActionButtons: () => {},
})

export function AdminProvider({ children }) {
  const [actionButtons, setActionButtons] = useState([])

  return <AdminContext.Provider value={{ actionButtons, setActionButtons }}>{children}</AdminContext.Provider>
}

export function useAdmin() {
  return useContext(AdminContext)
}
