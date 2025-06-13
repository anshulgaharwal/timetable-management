'use client';
import './result.css';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PollResultsListPage() {
  const [polls, setPolls] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/polls')
      .then((res) => res.json())
      .then((data) => setPolls(data.polls));
  }, []);

  const goToResult = (pollId) => {
    router.push(`/result/${pollId}`);
  };

  return (
    <main className="container">
      <h1>📊 Poll Results</h1>
      {polls.length === 0 ? (
        <p>Loading...</p>
      ) : (
        polls.map((poll, index) => (
          <div key={poll.id} className="poll-card">
  <h3>{poll.title}</h3>
  <p>{poll.question}</p>
  <p><strong>Poll Number:</strong> {index + 1}</p>
  <button onClick={() => goToResult(poll.id)}>View Result</button>
</div>

        ))
      )}
    </main>
  );
}
