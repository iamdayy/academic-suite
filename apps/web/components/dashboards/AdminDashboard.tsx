// 📁 apps/web/components/dashboards/AdminDashboard.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import api from "@/lib/api";
import {
  BookCopy,
  BookUser,
  CalendarDays,
  GraduationCap,
  Loader2,
  UserCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

// Tipe untuk state statistik
interface AdminStats {
  totalUsers: number;
  totalStudents: number;
  totalLecturers: number;
  totalCourses: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/stats/admin");
        setStats(response.data);
      } catch (error) {
        console.error("Gagal mengambil statistik admin:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="w-full max-w-6xl">
      {/* Bagian Statistik */}
      <h2 className="text-2xl font-bold mb-4">Ringkasan Sistem</h2>
      {isLoading ? (
        <div className="flex justify-center p-10">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        stats && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Mahasiswa
                </CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalStudents}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Dosen
                </CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalLecturers}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Akun User
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Mata Kuliah
                </CardTitle>
                <BookCopy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalCourses}</div>
              </CardContent>
            </Card>
          </div>
        )
      )}

      {/* Bagian Navigasi (yang sudah kita buat) */}
      <h2 className="text-2xl font-bold mb-4">Panel Manajemen</h2>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Akses Cepat</CardTitle>
          <CardDescription>Pilih modul untuk dikelola.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Button asChild size="lg" variant="outline">
              <Link href="/admin/academics">
                <BookCopy className="mr-2 h-4 w-4" /> Manajemen Akademik
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/admin/academic-years">
                <CalendarDays className="mr-2 h-4 w-4" /> Manajemen T.A. & Kelas
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/admin/users">
                <BookUser className="mr-2 h-4 w-4" /> Manajemen User
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/admin/lecturers">
                <UserCheck className="mr-2 h-4 w-4" /> Manajemen Dosen
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/admin/students">
                <GraduationCap className="mr-2 h-4 w-4" /> Manajemen Mahasiswa
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/admin/guardians">
                <Users className="mr-2 h-4 w-4" /> Manajemen Wali
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
