"use client";

import DashboardLayout from "../../components/DashboardLayout";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProfessorPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const sidebarTabs = [
    { label: "Dashboard", href: "/professor" },
    { label: "Manage Classes", href: "/professor/classes" },
    { label: "Students List", href: "/professor/students" },
    { label: "Upload Grades", href: "/professor/grades" },
    { label: "Create Poll", href: "/create" },
    { label: "Poll Results", href: "/result" },
    { label: "Profile", href: "/professor/profile" },
    { label: "Settings", href: "/professor/settings" },
  ];

  // 🔐 Role protection + redirect if unauthenticated
  useEffect(() => {
  if (status === "authenticated") {
    if (!session) return;
    if (session.user.role.toLowerCase() !== "professor") {
      router.replace("/unauthorized");
    }
  } else if (status === "unauthenticated") {
    router.replace("/signin");
  }
}, [status, session, router]);

  // ⏳ Loading state or session null
  if (status === "loading" || !session) return <div>Loading...</div>;

  return (
    <DashboardLayout sidebarTabs={sidebarTabs}>
      <h1>Welcome Professor!</h1>
      <p>Hi {session?.user?.name}, here is your teaching panel.</p>
      <ul>
        <li>📚 Manage Classes</li>
        <li>🧑‍🎓 Students List</li>
        <li>🧾 Upload Grades</li>
      </ul>
    </DashboardLayout>
  );
}
