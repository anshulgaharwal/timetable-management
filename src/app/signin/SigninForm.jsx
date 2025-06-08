'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SigninForm() {
  const searchParams = useSearchParams();
  const [error, setError] = useState(null);

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) setError(errorParam);
  }, [searchParams]);

  return (
    <div>
      <h1 className="text-xl font-bold">Sign In</h1>
      {error && <p className="text-red-500">{error}</p>}
      {/* your sign-in form */}
    </div>
  );
}
