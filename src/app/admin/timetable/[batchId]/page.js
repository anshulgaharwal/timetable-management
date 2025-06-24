'use client'
import html2pdf from 'html2pdf.js'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import './style.css' // 👈 Import external stylesheet

export default function BatchTimetablePage() {
  const { batchId } = useParams()
  const [entries, setEntries] = useState([])
  const [courses, setCourses] = useState([])
  const [professors, setProfessors] = useState([])
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [editData, setEditData] = useState({
    courseCode: '',
    professorId: '',
    classroom: '',
  })

  useEffect(() => {
    fetch(`/api/timetable/batch/${batchId}`).then(res => res.json()).then(setEntries)
    fetch('/api/form-data').then(res => res.json()).then(data => {
      setCourses(data.courses)
      setProfessors(data.professors)
    })
  }, [batchId])

  const getEntry = (day, slot) =>
    entries.find(e => e.day === day && e.timeSlot === slot)

  const handleCellClick = (day, timeSlot) => {
    const existing = getEntry(day, timeSlot)
    setEditData({
      courseCode: existing?.courseCode || '',
      professorId: existing?.professorId || '',
      classroom: existing?.classroom || '',
    })
    setSelectedSlot({ day, timeSlot })
  }

  const handleExportPDF = () => {
    const element = document.getElementById('timetable-grid')
    html2pdf().set({
      filename: `Batch-${batchId}-Timetable.pdf`,
      margin: [0.5, 0.5],
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' },
    }).from(element).save()
  }

  const handleDelete = async () => {
    const res = await fetch('/api/timetable/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        day: selectedSlot.day,
        timeSlot: selectedSlot.timeSlot,
        batchId,
      }),
    })

    if (res.ok) {
      setEntries(prev => prev.filter(e => !(e.day === selectedSlot.day && e.timeSlot === selectedSlot.timeSlot)))
      setSelectedSlot(null)
    }
  }

  const handleEditChange = (e) => {
    setEditData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSave = async () => {
    const res = await fetch('/api/timetable/upsert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...selectedSlot,
        ...editData,
        batchId,
      }),
    })

    const newEntry = await res.json()

    setEntries(prev => {
      const others = prev.filter(e => !(e.day === newEntry.day && e.timeSlot === newEntry.timeSlot))
      return [...others, newEntry]
    })

    setSelectedSlot(null)
  }

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  const slots = [
    '09:00-10:00',
    '10:00-11:00',
    '11:00-12:00',
    '12:00-13:00',
    '14:00-15:00',
    '15:00-16:00',
    '16:00-17:00',
  ]

  const getColorClass = (courseCode) => {
    const hash = Array.from(courseCode).reduce((acc, c) => acc + c.charCodeAt(0), 0)
    const colorIndex = (hash % 6) + 1 // Adjust total number of color classes here
    return `course-color-${colorIndex}`
  }

  return (
    <div className="container">
      <h2>Timetable - Batch {batchId}</h2>

      <table id="timetable-grid" className="timetable">
        <thead>
          <tr>
            <th>Time</th>
            {days.map(day => <th key={day}>{day}</th>)}
          </tr>
        </thead>
        <tbody>
          {slots.map(slot => (
            <tr key={slot}>
              <td><strong>{slot}</strong></td>
              {days.map(day => {
                const entry = getEntry(day, slot)
                const colorClass = entry ? getColorClass(entry.course.code) : ''
                return (
                  <td
                    key={day + slot}
                    className={`cell ${colorClass}`}
                    onClick={() => handleCellClick(day, slot)}
                  >
                    {entry ? (
                      <>
                        <div><b>{entry.course.name}</b></div>
                        <div>{entry.classroom}</div>
                        <div className="prof">{entry.professor.name}</div>
                      </>
                    ) : '-'}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <button className="export-btn" onClick={handleExportPDF}>📄 Export to PDF</button>

      {selectedSlot && (
        <div className="modal-overlay" onClick={() => setSelectedSlot(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Edit Slot: {selectedSlot.day}, {selectedSlot.timeSlot}</h3>

            <label>Course:
              <select name="courseCode" value={editData.courseCode} onChange={handleEditChange}>
                <option value="">-- Select --</option>
                {courses.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
              </select>
            </label>

            <label>Professor:
              <select name="professorId" value={editData.professorId} onChange={handleEditChange}>
                <option value="">-- Select --</option>
                {professors.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </label>

            <label>Classroom:
              <input name="classroom" value={editData.classroom} onChange={handleEditChange} />
            </label>

            <div className="modal-buttons">
              <button onClick={handleSave}>💾 Save</button>
              <button onClick={() => setSelectedSlot(null)}>Cancel</button>
            </div>
            <button className="delete-btn" onClick={handleDelete}>🗑 Delete</button>
          </div>
        </div>
      )}
    </div>
  )
}
