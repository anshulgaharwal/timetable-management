'use client'
import { useEffect, useState } from 'react'
import TimetableGrid from '@/components/TimetableGrid'

export default function StudentTimetable() {
  const [entries, setEntries] = useState([])

  useEffect(() => {
    fetch('/api/timetable/student').then(res => res.json()).then(setEntries)
  }, [])

  return (
    <div>
      <h2>Your Weekly Timetable</h2>
      <TimetableGrid entries={entries} />
    </div>
  )
}
