// 📁 apps/web/app/(app)/dashboard/page.tsx
"use client";

import AdminDashboard from "@/components/dashboards/AdminDashboard";
import GuardianDashboard from "@/components/dashboards/GuardianDashboard";
import LecturerDashboard from "@/components/dashboards/LecturerDashboard";
import StudentDashboard from "@/components/dashboards/StudentDashboard";
import { useAuthStore } from "@/stores/authStore";
import { Role } from "shared-types";

export default function DashboardPage() {
  const { user } = useAuthStore();

  const renderDashboardByRole = () => {
    switch (user?.role.roleName) {
      case Role.ADMIN:
        return <AdminDashboard />;
      case Role.LECTURER:
        return <LecturerDashboard />;
      case Role.STUDENT:
        return <StudentDashboard />;
      case Role.GUARDIAN:
        return <GuardianDashboard />;
      default:
        return null; // Akan ditangani oleh Guard
    }
  };

  return (
    <div className="flex flex-col items-center">{renderDashboardByRole()}</div>
  );
}
