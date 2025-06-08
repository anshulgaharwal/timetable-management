'use client';
import DashboardLayout from '../../../components/DashboardLayout';
import { useSession } from 'next-auth/react';

export default function AdminDashboard() {
  const { data: session } = useSession();

  return (
    <DashboardLayout>
      <h1>Welcome Admin!</h1>
      <p>Manage platform-wide activities.</p>
      <ul>
        <li>🧾 User Management</li>
        <li>📢 Announcements</li>
        <li>📦 Reports</li>
      </ul>
    </DashboardLayout>
  );
}
