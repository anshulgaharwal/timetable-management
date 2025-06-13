'use client';
import './respond.css';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function RespondToPoll() {
  const router = useRouter();
  const { pollId } = useParams();

  const [poll, setPoll] = useState(null);
  const [selectedOptionId, setSelectedOptionId] = useState(null);

  useEffect(() => {
    fetch(`/api/poll/${pollId}`)
      .then((res) => res.json())
      .then((data) => setPoll(data.poll));
  }, [pollId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOptionId) return alert('Please select an option.');

    const res = await fetch('/api/respond', {
      method: 'POST',
      body: JSON.stringify({ pollId, optionId: selectedOptionId }),
      headers: { 'Content-Type': 'application/json' },
    });

    if (res.ok) {
      router.push('/respond/success');
    } else {
      alert('Failed to submit response.');
    }
  };

  if (!poll) return <main className="container">Loading...</main>;
  if (!poll.isActive) return <main className="container">This poll is closed.</main>;

  return (
    <main className="container">
      <h1>{poll.title}</h1>
      <p>{poll.question}</p>
      <form onSubmit={handleSubmit}>
        {poll.options.map((opt) => (
          <div key={opt.id}>
            <input
              type="radio"
              id={opt.id}
              name="option"
              value={opt.id}
              onChange={() => setSelectedOptionId(opt.id)}
              required
            />
            <label htmlFor={opt.id}>{opt.text}</label>
          </div>
        ))}
        <button type="submit">Submit Response</button>
      </form>
    </main>
  );
}
