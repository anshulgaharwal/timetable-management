"use client"
import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useAdmin } from "../../../../contexts/AdminContext"
import { useParams, useRouter } from "next/navigation"
import styles from "../degrees.module.css"

export default function DegreeCoursesPage() {
  const { data: session } = useSession()
  const { setActionButtons } = useAdmin()
  const params = useParams()
  const router = useRouter()
  const degreeCode = params.code

  const [degree, setDegree] = useState(null)
  const [courses, setCourses] = useState([])
  const [showCourseForm, setShowCourseForm] = useState(false)
  const [courseFormMode, setCourseFormMode] = useState("add")
  const [courseFormData, setCourseFormData] = useState({ name: "", code: "" })
  const [selectedCourse, setSelectedCourse] = useState(null)

  useEffect(() => {
    fetchDegree()
  }, [degreeCode])

  useEffect(() => {
    setActionButtons([
      {
        label: "Add Course",
        onClick: () => {
          setCourseFormMode("add")
          setCourseFormData({ name: "", code: "" })
          setShowCourseForm(true)
        },
        className: styles.primaryButton,
      },
      {
        label: "Back to Degrees",
        onClick: () => router.push("/admin/degrees"),
        className: styles.secondaryButton,
      },
    ])
  }, [setActionButtons, router])

  const fetchDegree = async () => {
    try {
      const response = await fetch("/api/degree")
      const data = await response.json()
      const foundDegree = data.find((d) => d.code === degreeCode)

      if (foundDegree) {
        setDegree(foundDegree)
        setCourses(foundDegree.courses || [])
      } else {
        router.push("/admin/degrees")
      }
    } catch (error) {
      console.error("Error fetching degree:", error)
    }
  }

  const handleCourseFormChange = (e) => {
    const { name, value } = e.target
    setCourseFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCourseFormSubmit = async (e) => {
    e.preventDefault()

    try {
      if (courseFormMode === "add") {
        await fetch("/api/course", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...courseFormData,
            degreeId: degreeCode,
          }),
        })
      } else {
        await fetch("/api/course", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: selectedCourse.code,
            ...courseFormData,
            degreeId: degreeCode,
          }),
        })
      }

      setShowCourseForm(false)
      fetchDegree()
    } catch (error) {
      console.error("Error saving course:", error)
    }
  }

  const handleDeleteCourse = async (course) => {
    if (window.confirm(`Are you sure you want to delete ${course.name}?`)) {
      try {
        await fetch("/api/course", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: course.code }),
        })
        fetchDegree()
      } catch (error) {
        console.error("Error deleting course:", error)
      }
    }
  }

  const handleEditCourse = (course) => {
    setSelectedCourse(course)
    setCourseFormData({ name: course.name, code: course.code })
    setCourseFormMode("edit")
    setShowCourseForm(true)
  }

  if (!degree) {
    return <div>Loading...</div>
  }

  return (
    <div className={styles.degreesContainer}>
      <h1>
        {degree.name} ({degree.code}) - Courses
      </h1>

      {showCourseForm && (
        <div className={styles.formContainer}>
          <h2 className={styles.formTitle}>{courseFormMode === "add" ? "Add New Course" : "Edit Course"}</h2>
          <form onSubmit={handleCourseFormSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="code">Course Code</label>
              <input type="text" id="code" name="code" value={courseFormData.code} onChange={handleCourseFormChange} required disabled={courseFormMode === "edit"} />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="name">Course Name</label>
              <input type="text" id="name" name="name" value={courseFormData.name} onChange={handleCourseFormChange} required />
            </div>
            <div className={styles.buttonGroup}>
              <button type="submit" className={`${styles.button} ${styles.primaryButton}`}>
                {courseFormMode === "add" ? "Add Course" : "Update Course"}
              </button>
              <button type="button" className={`${styles.button} ${styles.secondaryButton}`} onClick={() => setShowCourseForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className={styles.degreesList}>
        {courses.length > 0 ? (
          courses.map((course) => (
            <div key={course.code} className={styles.degreeItem}>
              <div className={styles.actionButtons}>
                <button className={`${styles.actionButton}`} onClick={() => handleEditCourse(course)}>
                  ✏️
                </button>
                <button className={`${styles.actionButton} ${styles.deleteButton}`} onClick={() => handleDeleteCourse(course)}>
                  🗑️
                </button>
              </div>
              <h2>{course.name}</h2>
              <div className={styles.degreeCode}>{course.code}</div>
            </div>
          ))
        ) : (
          <p>No courses found for this degree. Add a course to get started.</p>
        )}
      </div>
    </div>
  )
}
