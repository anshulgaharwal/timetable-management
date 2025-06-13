'use client';
import './view.css';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ViewPollsPage() {
  const [polls, setPolls] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/polls')
      .then((res) => res.json())
      .then((data) => setPolls(data.polls));
  }, []);

  const goToResponse = (pollId) => {
    router.push(`/respond/${pollId}`);
  };

  return (
    <main className="container">
      <h1>📋 All Polls</h1>
      {polls.length === 0 ? (
        <p>Loading polls...</p>
      ) : (
        polls.map((poll, index) => (
          <div key={poll.id} className="poll-card">
            <div className="poll-card-header">
              <h3>{poll.title}</h3>
              <span className={`status-dot ${poll.isActive ? 'status-active' : 'status-inactive'}`}></span>
            </div>
            <p>{poll.question}</p>
            <p><strong>Poll Number:</strong> {index + 1}</p>
            <button onClick={() => goToResponse(poll.id)}>📝 Fill Response</button>
          </div>
        ))
      )}
    </main>
  );
}
