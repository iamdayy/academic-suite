// 📁 apps/web/components/dashboards/GuardianDashboard.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import api from "@/lib/api";
import { BookOpen, Loader2, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

// Definisikan tipe datanya
interface MyStudent {
  id: bigint;
  name: string;
  nim: string;
  studyProgram: { name: string };
  user: { email: string };
}
interface GuardianStats {
  totalStudents: number;
  takingCredits: number;
}

export default function GuardianDashboard() {
  const [students, setStudents] = useState<MyStudent[]>([]);
  const [stats, setStats] = useState<GuardianStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Panggil kedua API secara paralel
        const [statsRes, studentsRes] = await Promise.all([
          api.get("/stats/guardian/me"),
          api.get("/guardian-view/my-students"),
        ]);
        setStats(statsRes.data);
        setStudents(studentsRes.data);
      } catch (error) {
        console.error("Gagal mengambil data guardian:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="w-full max-w-4xl">
      {/* Bagian Statistik */}
      <h2 className="text-2xl font-bold mb-4">Ringkasan Wali</h2>
      {isLoading || !stats ? (
        <div className="flex justify-center p-10">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Mahasiswa Diwalikan
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                MatKul (KRS Draft)
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.takingCredits}</div>
              <p className="text-xs text-muted-foreground">
                Total matkul di KRS draft semua anak
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Bagian Navigasi (Tabel) */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Daftar Mahasiswa yang Diwalikan</CardTitle>
          <CardDescription>
            Pilih mahasiswa untuk melihat detail akademik mereka.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-10">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>{/* ... (Header Tabel) ... */}</TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id.toString()}>
                    <TableCell>{student.nim}</TableCell>
                    <TableCell className="font-medium">
                      {student.name}
                    </TableCell>
                    <TableCell>{student.user.email}</TableCell>
                    <TableCell>{student.studyProgram.name}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/guardian/student/${student.id}`}>
                          Lihat Detail
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {!students.length && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-muted-foreground"
                    >
                      Anda belum terhubung dengan mahasiswa manapun.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
