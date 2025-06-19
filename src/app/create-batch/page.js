'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import './style.css'; // ✅ Import your CSS

const degreeCourseMap = {
  'Bachelor of Technology (BTech)': [
    'Computer Science and Engineering',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Metallurgical Engineering and Materials Science',
    'Chemical Engineering',
    'Mathematics and Computing',
    'Engineering Physics',
    'Space Science and Engineering (SSE)',
  ],
  'Master of Technology (MTech)': [
    'Electrical Engineering with specialization in Communication and Signal Processing',
    'Electrical Engineering with specialization in VLSI Design and Nanoelectronics',
    'Mechanical Engineering with specialization in Advanced Manufacturing (AM)',
    'Mechanical Engineering with specialization in Thermal Energy Systems (TES)',
    'Mechanical Engineering with specialization in Mechanical Systems Design',
    'Metallurgical Engineering and Materials Science with specialization in Materials Science and Engineering',
    'Metallurgical Engineering and Materials Science with specialization in Metallurgical Engineering',
    'M.Tech. in Electric Vehicle Technology',
    'M.Tech. in Space Engineering',
    'Computer Science and Engineering with specialization in Computer Science and Engineering',
    'Civil Engineering with specialization in Water, Climate and Sustainability',
    'Biosciences and Biomedical Engineering with specialization in Biomedical Engineering',
    'Mechanical Engineering with specialization in Applied Optics and laser Technology',
    'Civil Engineering with specialization in Structural Engineering',
    'Center of Futuristic Defence and Space Technology with specialization in Defence Technology',
    'Electrical Engineering with specialization in Power Systems and Power Electronics',
    'Biosciences and Biomedical Engineering with specialization in Biomedical Devices',
  ],
  'Master of Science (MSc)': [
    'Chemistry',
    'Physics',
    'Mathematics',
    'Biotechnology',
    'Astronomy',
  ],
  'BTech + MTech': [
    'BTech in Electrical Engineering with MTech in Communication and Signal Processing',
    'BTech in Electrical Engineering with MTech in VLSI Design and Nanoelectronics',
    'BTech in Mechanical Engineering with MTech in Production and Industrial Engineering',
    'BTech in Mechanical Engineering with MTech in Mechanical Systems Design',
  ],
  'MS(Research)': [
    'MS (Research) in Computer Science and Engineering',
    'MS (Research) in Electrical Engineering',
    'MS (Research) in Mechanical Engineering',
    'M.S. (Research) in Space Science and Engineering',
    'M.S. (Research) in Humanities and Social Sciences',
    'Master of Science in Data Science and Management (MS-DSM)',
  ],
  'Doctor of Philosophy': [
    'Computer Science and Engineering',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Metallurgical Engineering and Materials Science',
    'Bio-sciences and Bio-medical Engineering',
    'Chemistry',
    'Physics',
    'Mathematics',
    'English',
    'Philosophy',
    'Economics',
    'Psychology',
    'Sociology',
    'Astronomy, Astrophysics and Space Engineering',
    'Centre of Advanced Electronics',
    'Centre for Rural Development and Technology (CRDT)',
    'Center for Electric Vehicle and Intelligent Transport Systems (CEVITS)',
    'Center of Futuristic Defense and Space Technology (CFDST)',
    'JP Narayan National Center of Excellence in the Humanities',
    'Chemical Engineering',
  ],
  'M.A. ENGLISH': [
    'MA English (Literature and Linguistics)',
  ]
};

export default function CreateBatch() {
  const router = useRouter();
  const [degree, setDegree] = useState('');
  const [course, setCourse] = useState('');
  const [startYear, setStartYear] = useState('');
  const [endYear, setEndYear] = useState('');

  const handleSubmit = async () => {
    const res = await fetch('/api/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ degree, course, startYear, endYear }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('API Error:', errText);
      alert("Failed to create batch");
      return;
    }

    const { batch } = await res.json();
    router.push(`/batch/${batch.id}`);
  };

  return (
    <div className="create-batch-container">
      <h2>Create Batch</h2>

      <label>Degree:
        <select value={degree} onChange={e => setDegree(e.target.value)}>
          <option value="">--Select Degree--</option>
          {Object.keys(degreeCourseMap).map((deg) => (
            <option key={deg} value={deg}>{deg}</option>
          ))}
        </select>
      </label>

      {degree && (
        <label>Course:
          <select value={course} onChange={e => setCourse(e.target.value)}>
            <option value="">--Select Course--</option>
            {degreeCourseMap[degree].map((crs) => (
              <option key={crs} value={crs}>{crs}</option>
            ))}
          </select>
        </label>
      )}

      <label>Start Year:
        <input type="number" value={startYear} onChange={e => setStartYear(e.target.value)} />
      </label>

      <label>End Year:
        <input type="number" value={endYear} onChange={e => setEndYear(e.target.value)} />
      </label>

      <button onClick={handleSubmit}>Create Batch</button>
    </div>
  );
}
