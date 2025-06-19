'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import './style.css'; // ✅ Import the stylesheet

export default function AllBatchesPage() {
  const [batches, setBatches] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/batches')
      .then(res => res.json())
      .then(data => setBatches(data.batches));
  }, []);

  return (
    <main className="page-container">
      <h2 className="page-heading">All Batches</h2>
      {batches.length === 0 && <p>No batches yet.</p>}
      {batches.map((batch) => (
        <div key={batch.id} className="batch-card">
          <h3>{batch.degree}</h3>
          <p><strong>Course:</strong> {batch.course}</p>
          <p><strong>Years:</strong> {batch.startYear} - {batch.endYear}</p>
          <p><strong>Students:</strong> {batch.students.length}</p>
          <button
            className="view-button"
            onClick={() => router.push(`/batch/${batch.id}`)}
          >
            View Enrolled Students
          </button>
        </div>
      ))}
    </main>
  );
}
