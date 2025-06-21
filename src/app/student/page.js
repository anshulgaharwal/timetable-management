"use client";

import DashboardLayout from "../../components/DashboardLayout";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function StudentDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // 🔐 Protect route from unauthorized roles
  useEffect(() => {
  if (status === "authenticated") {
    if (!session) return;
    if (session.user.role.toLowerCase() !== "student") {
      router.replace("/unauthorized");
    }
  } else if (status === "unauthenticated") {
    router.replace("/signin");
  }
}, [status, session, router]);

  // ⏳ Show loading while session is being checked or during redirect
  if (status === "loading" || !session) return <div>Loading...</div>;

  return (
    <DashboardLayout>
      <div
        style={{
          background: "white",
          padding: "30px",
          borderRadius: "16px",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
          marginTop: "20px",
        }}
      >
        <h1 style={{ color: "#2c3e50", fontSize: "2rem", marginBottom: "10px" }}>
          Welcome Student!
        </h1>
        <p style={{ fontSize: "1.1rem", color: "#555", marginBottom: "25px" }}>
          Hello {session?.user?.name}, explore your dashboard.
        </p>

        <ul style={{ marginBottom: "30px" }}>
          <li>📘 Your Courses</li>
          <li>📝 Assignments</li>
          <li>📊 Grades</li>
        </ul>

        {/* Poll Section */}
        <div>
          <h2 style={{ color: "#34495e", marginBottom: "15px" }}>Poll Activities</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "15px" }}>
            <button
              onClick={() => router.push("/respond")}
              style={{
                padding: "10px 20px",
                borderRadius: "8px",
                backgroundColor: "#f39c12",
                color: "white",
                border: "none",
                cursor: "pointer",
              }}
            >
              🗳️ Polls
            </button>
            <button
              onClick={() => router.push("/result")}
              style={{
                padding: "10px 20px",
                borderRadius: "8px",
                backgroundColor: "#27ae60",
                color: "white",
                border: "none",
                cursor: "pointer",
              }}
            >
              📊 Poll Results
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
