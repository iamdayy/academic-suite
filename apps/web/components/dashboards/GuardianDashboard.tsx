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
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import api from "@/lib/api";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

// Definisikan tipe data
interface MyStudent {
  id: bigint;
  name: string;
  nim: string;
  studyProgram: { name: string };
  user: { email: string };
}

export default function GuardianDashboard() {
  const [students, setStudents] = useState<MyStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMyStudents = async () => {
      try {
        // Panggil endpoint baru kita
        const response = await api.get("/guardian-view/my-students");
        setStudents(response.data);
      } catch (error) {
        console.error("Gagal mengambil data mahasiswa:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMyStudents();
  }, []);

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Guardian Dashboard</CardTitle>
        <CardDescription>
          Berikut adalah daftar mahasiswa yang Anda walikan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center mt-10">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>NIM</TableHead>
                <TableHead>Nama Mahasiswa</TableHead>
                <TableHead>Email Akun</TableHead>
                <TableHead>Program Studi</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id.toString()}>
                  <TableCell>{student.nim}</TableCell>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell>{student.user?.email}</TableCell>
                  <TableCell>{student.studyProgram.name}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" asChild>
                      {/* Link ke halaman detail (Level 2) */}
                      <Link href={`/guardian/student/${student.id}`}>
                        Lihat Detail
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {!isLoading && students.length === 0 && (
          <p className="text-center text-muted-foreground mt-10">
            Anda belum terhubung dengan mahasiswa manapun.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
