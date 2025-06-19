'use client'
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import './style.css'; // ✅ Import stylesheet

export default function BatchDetailPage() {
  const { id } = useParams();
  const [students, setStudents] = useState([]);
  const [name, setName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [batch, setBatch] = useState(null);

  useEffect(() => {
    fetch(`/api/batch/${id}`)
      .then(res => res.json())
      .then(data => setStudents(data.students));

    fetch('/api/batches')
      .then(res => res.json())
      .then(data => {
        const b = data.batches.find(b => b.id === parseInt(id));
        setBatch(b);
      });
  }, [id]);

  const addStudent = async () => {
    if (!name || !rollNo || !batch) return;

    const res = await fetch('/api/student', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, rollNo: parseInt(rollNo), batchId: parseInt(id) }),
    });

    const { student } = await res.json();
    setStudents([...students, student]);
    setName('');
    setRollNo('');
  };

  return (
    <main className="page-container">
      <h2 className="batch-heading">Batch: {batch ? `${batch.degree} - ${batch.course}` : 'Loading...'}</h2>
      <p className="batch-dates">{batch ? `${batch.startYear} - ${batch.endYear}` : ''}</p>

      <h3 className="section-heading">Add New Student</h3>
      <input
        type="text"
        placeholder="Student Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="input-field"
      />
      <input
        type="number"
        placeholder="Roll Number"
        value={rollNo}
        onChange={(e) => setRollNo(e.target.value)}
        className="input-field"
      />
      <button onClick={addStudent} className="add-button">Add Student</button>

      <h3 className="section-heading">Enrolled Students</h3>
      <table className="student-table">
        <thead>
          <tr>
            <th>Roll Number</th>
            <th>Name</th>
            <th>Email ID</th>
          </tr>
        </thead>
        <tbody>
          {students.map((stu) => (
            <tr key={stu.id}>
              <td>{stu.rollNo}</td>
              <td>{stu.name}</td>
              <td>{stu.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
