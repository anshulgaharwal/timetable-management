'use client'
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import '../../styles/auth.css';

export default function Signin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await signIn('credentials', {
      redirect: false,
      email: form.email,
      password: form.password,
      callbackUrl,
    });

    if (res.ok) {
      router.push(res.url);
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit}>
        <h2>Sign In</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <input
          type="email"
          placeholder="Email"
          required
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          required
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button type="submit">Sign In</button>
        <p>Create account <a href="/signup">Sign Up</a></p>
        <button type="button" className="google-btn" onClick={() => signIn("google")}>
          <img src="/google-logo.png" alt="Google" /> Sign in with Google
        </button>
      </form>
    </div>
  );
}
