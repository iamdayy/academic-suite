// 📁 apps/web/components/dashboards/StudentDashboard.tsx
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
  Book,
  BookOpenCheck,
  ClipboardList,
  Loader2,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

// Tipe untuk state statistik
interface StudentStats {
  ipk: string;
  totalSKS: number;
  takingCredits: number;
}

export default function StudentDashboard() {
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/stats/student/me");
        setStats(response.data);
      } catch (error) {
        console.error("Gagal mengambil statistik mahasiswa:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="w-full max-w-4xl">
      {/* Bagian Statistik */}
      <h2 className="text-2xl font-bold mb-4">Ringkasan Akademik</h2>
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
                  IPK (Kumulatif)
                </CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.ipk}</div>
                <p className="text-xs text-muted-foreground">dari 4.00</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total SKS (Lulus)
                </CardTitle>
                <BookOpenCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalSKS}</div>
                <p className="text-xs text-muted-foreground">
                  Total SKS yang telah diambil & dinilai
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  SKS Semester Ini
                </CardTitle>
                <Book className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.takingCredits}</div>
                <p className="text-xs text-muted-foreground">
                  Mata kuliah di KRS (Draft)
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
          <CardTitle>Panel Akademik</CardTitle>
          <CardDescription>Kelola studi dan lihat tugas Anda.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Button asChild size="lg">
              <Link href="/krs">
                <Book className="mr-2 h-4 w-4" />
                Kartu Rencana Studi (KRS)
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/assignments">
                <ClipboardList className="mr-2 h-4 w-4" />
                Tugas Saya
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
