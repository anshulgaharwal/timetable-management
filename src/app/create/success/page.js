'use client';
import { useSearchParams, useRouter } from 'next/navigation';

export default function PollSuccessPage() {
  const params = useSearchParams();
  const pollId = params.get('id');
  const router = useRouter();

  return (
    <main className="container">
      <h1>✅ Poll Created Successfully!</h1>
      <a href="/">🏠 Go Home</a>
      <a href={`/result/${pollId}`}>📊 View Result</a>
    </main>
  );
}
