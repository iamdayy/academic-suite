// 📁 apps/web/components/dashboards/LecturerDashboard.tsx
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
import { FileWarning, Loader2, School, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

// Tipe untuk state statistik
interface LecturerStats {
  activeClasses: number;
  totalStudentsEnrolled: number;
  pendingSubmissions: number;
}

export default function LecturerDashboard() {
  const [stats, setStats] = useState<LecturerStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/stats/lecturer/me");
        setStats(response.data);
      } catch (error) {
        console.error("Gagal mengambil statistik dosen:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="w-full max-w-4xl">
      {/* Bagian Statistik */}
      <h2 className="text-2xl font-bold mb-4">Ringkasan Mengajar</h2>
      {isLoading ? (
        <div className="flex justify-center p-10">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        stats && (
          <div className="grid gap-4 md:grid-cols-3 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Kelas Aktif
                </CardTitle>
                <School className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeClasses}</div>
                <p className="text-xs text-muted-foreground">
                  Total kelas yang Anda ajar tahun ini
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Mahasiswa
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalStudentsEnrolled}
                </div>
                <p className="text-xs text-muted-foreground">
                  Di semua kelas aktif Anda
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Tugas Belum Dinilai
                </CardTitle>
                <FileWarning className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.pendingSubmissions}
                </div>
                <p className="text-xs text-muted-foreground">
                  Submission yang menunggu nilai
                </p>
              </CardContent>
            </Card>
          </div>
        )
      )}

      {/* Bagian Navigasi */}
      <h2 className="text-2xl font-bold mb-4">Akses Cepat</h2>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Panel Mengajar</CardTitle>
          <CardDescription>
            Kelola kelas, materi, dan tugas Anda.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            <Button asChild size="lg">
              <Link href="/lecturer/classes">
                <School className="mr-2 h-4 w-4" />
                Lihat Kelas yang Saya Ajar
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
