'use client'

export default function TimetableGrid({ entries }) {
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

  const getEntry = (day, slot) =>
    entries.find(e => e.day === day && e.timeSlot === slot)

  return (
    <div className="timetable-container">
      <table className="timetable">
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
                return (
                  <td key={day + slot} className={entry ? 'has-entry' : 'empty'}>
                    {entry ? (
                      <>
                        <div><strong>{entry.course.name}</strong></div>
                        <div>{entry.classroom}</div>
                        <div style={{ fontSize: '0.8em', color: '#444' }}>{entry.professor?.name}</div>
                      </>
                    ) : '-'}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <style jsx>{`
        .timetable-container {
          overflow-x: auto;
          margin-top: 1rem;
        }
        .timetable {
          width: 100%;
          border-collapse: collapse;
          text-align: center;
          font-family: Arial, sans-serif;
          background: #f9f9f9;
        }
        th, td {
          border: 1px solid #ccc;
          padding: 8px;
        }
        th {
          background-color: #f0f0f0;
        }
        .has-entry {
          background-color: #e1f5fe;
        }
        .empty {
          background-color: #fff;
        }
      `}</style>
    </div>
  )
}
