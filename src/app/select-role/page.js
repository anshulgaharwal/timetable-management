'use client';
import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import '../../styles/auth.css';

export default function SelectRole() {
  const [role, setRole] = useState('');
  const { data: session } = useSession();
  const router = useRouter();

  const handleGoogleSignIn = () => {
    if (!role) return alert("Please select a role first");
    localStorage.setItem("selectedRole", role);
    signIn("google");
  };

  useEffect(() => {
    const selectedRole = localStorage.getItem("selectedRole");

    if (session?.user && selectedRole) {
      fetch("/api/set-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: session.user.email,
          role: selectedRole,
        }),
      })
        .then((res) => {
          if (res.ok) {
            localStorage.removeItem("selectedRole");
            router.push(`/${selectedRole}/dashboard`);
          }
        });
    }
  }, [session]);

  return (
    <div className="auth-container">
      <h2>Select Role</h2>
      <select onChange={(e) => setRole(e.target.value)} value={role}>
        <option value="">Choose role</option>
        <option value="student">Student</option>
        <option value="administration">Administration</option>
        <option value="professor">Professor</option>
      </select>
      <button className="google-btn" onClick={handleGoogleSignIn}>
        <img src="/google-logo.png" alt="Google" /> Sign in with Google
      </button>
    </div>
  );
}
