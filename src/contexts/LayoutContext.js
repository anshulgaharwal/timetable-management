"use client"

import { createContext, useContext, useState, useCallback } from "react"

const LayoutContext = createContext({
  // Page header state
  pageTitle: "",
  setPageTitle: () => {},
  actionButtons: [],
  setActionButtons: () => {},

  // Sidebar state
  sidebarTabs: [],
  setSidebarTabs: () => {},

  // Loading states for specific components
  isLoading: false,
  setIsLoading: () => {},
  loadingStates: {},
  setLoadingState: () => {},

  // Mobile state
  isMobileSidebarOpen: false,
  setIsMobileSidebarOpen: () => {},
})

export function LayoutProvider({ children }) {
  const [pageTitle, setPageTitle] = useState("")
  const [actionButtons, setActionButtons] = useState([])
  const [sidebarTabs, setSidebarTabs] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [loadingStates, setLoadingStates] = useState({})
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  // Optimized function to set loading state for specific components
  const setLoadingState = useCallback((key, loading) => {
    setLoadingStates((prev) => ({
      ...prev,
      [key]: loading,
    }))
  }, [])

  // Clear all action buttons
  const clearActionButtons = useCallback(() => {
    setActionButtons([])
  }, [])

  // Clear all loading states
  const clearLoadingStates = useCallback(() => {
    setLoadingStates({})
    setIsLoading(false)
  }, [])

  return (
    <LayoutContext.Provider
      value={{
        // Page header
        pageTitle,
        setPageTitle,
        actionButtons,
        setActionButtons,
        clearActionButtons,

        // Sidebar
        sidebarTabs,
        setSidebarTabs,

        // Loading states
        isLoading,
        setIsLoading,
        loadingStates,
        setLoadingState,
        clearLoadingStates,

        // Mobile
        isMobileSidebarOpen,
        setIsMobileSidebarOpen,
      }}
    >
      {children}
    </LayoutContext.Provider>
  )
}

export function useLayout() {
  return useContext(LayoutContext)
}
