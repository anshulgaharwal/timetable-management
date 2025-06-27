"use client"

import { createContext, useContext, useState } from "react"

const ProfessorsContext = createContext()

export function ProfessorsProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false)
  const [professors, setProfessors] = useState([])
  const [error, setError] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [currentProfessor, setCurrentProfessor] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  })

  return (
    <ProfessorsContext.Provider
      value={{
        isLoading,
        setIsLoading,
        professors,
        setProfessors,
        error,
        setError,
        showAddForm,
        setShowAddForm,
        showEditForm,
        setShowEditForm,
        currentProfessor,
        setCurrentProfessor,
        formData,
        setFormData,
      }}
    >
      {children}
    </ProfessorsContext.Provider>
  )
}

export const useProfessors = () => useContext(ProfessorsContext)
