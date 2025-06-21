"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAdmin } from "../../contexts/AdminContext";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { setActionButtons } = useAdmin();

  // 🔐 Redirect if not ADMIN or unauthenticated
  useEffect(() => {
  if (status === "authenticated") {
    if (!session) return;
    if (session.user.role.toLowerCase() !== "admin") {
      router.replace("/unauthorized");
    }
  } else if (status === "unauthenticated") {
    router.replace("/signin");
  }
}, [status, session, router]);


  // ⏳ Wait for session to load or redirect
  if (status === "loading" || !session) return <div>Loading...</div>;

  // 🎛 Set action buttons when admin is authenticated
  useEffect(() => {
    if (session?.user?.role === "ADMIN") {
      setActionButtons([
        {
          label: "Add User",
          onClick: () => router.push("/admin/users/add"),
        },
        {
          label: "System Status",
          onClick: () => alert("System is running normally"),
        },
        {
          label: "Create Poll",
          onClick: () => router.push("/create"),
        },
        {
          label: "Poll Results",
          onClick: () => router.push("/result"),
        },
        {
          label: "PCreate Batch",
          onClick: () => router.push("/create-batch"),
        },
        {
          label: "View Batches",
          onClick: () => router.push("/batches"),
        },
      ]);
    }

    // 🧹 Cleanup buttons on unmount
    return () => setActionButtons([]);
  }, [session, setActionButtons, router]);

  return (
    <div className="admin-content">
      <h1>Welcome Administrator!</h1>
      <p>Hi {session?.user?.name}, manage the system.</p>
      <ul>
        <li>Manage Users</li>
        <li>Manage Professors</li>
        <li>System Settings</li>
      </ul>
    </div>
  );
}
