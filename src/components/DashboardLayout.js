'use client';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import '../styles/dashboard.css'; 

export default function DashboardLayout({ children }) {
  const { data: session } = useSession();
  const path = usePathname();

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="logo">🎓 MyApp</div>
        <div className="user-info">
          {session?.user?.name} ({session?.user?.role})
          <button onClick={() => signOut()}>Logout</button>
        </div>
      </nav>
      <div className="main">
        <aside className="sidebar">
          <a href="/dashboard/student">Home</a>
          <a href="#">Profile</a>
          <a href="#">Settings</a>
        </aside>
        <section className="content">{children}</section>
      </div>
    </div>
  );
}
