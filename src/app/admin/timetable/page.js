'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function AdminTimetable() {
  const [batches, setBatches] = useState([])

  useEffect(() => {
    fetch('/api/form-data').then(res => res.json()).then(data => {
      setBatches(data.batches)
    })
  }, [])

  return (
    <div className="batch-grid">
      {batches.map(batch => (
        <Link key={batch.id} href={`/admin/timetable/${batch.id}`}>
          <div className="batch-card">
            <h3>Batch {batch.id}</h3>
            <p>Course: {batch.courseCode}</p>
          </div>
        </Link>
      ))}

      <style jsx>{`
        .batch-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 20px;
          padding: 20px;
        }
        .batch-card {
          background: white;
          border-radius: 10px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
          padding: 20px;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          cursor: pointer;
        }
        .batch-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }
      `}</style>
    </div>
  )
}
