// 📁 apps/web/app/(app)/guardian/student/[id]/page.tsx
"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
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
import { useAuthStore } from "@/stores/authStore"; // Kita butuh ini untuk guard
import { ChevronLeft, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Definisikan tipe datanya
interface KrsDetail {
  course: { code: string; name: string; credits: number };
  grade: string | null;
}
interface KrsHeader {
  id: bigint;
  status: string;
  academicYear: { year: string; semester: string };
  krsDetails: KrsDetail[];
}
interface StudentDetails {
  id: bigint;
  name: string;
  nim: string;
  studyProgram: { name: string; level: string };
  user: { email: string };
  krsHeaders: KrsHeader[];
}

// Helper untuk hitung IPK (Sederhana)
const calculateIPS = (details: KrsDetail[]) => {
  let totalSKS = 0;
  let totalBobot = 0;
  // TODO: Ini harusnya mengambil dari database, tapi untuk sekarang kita hardcode
  const gradeMap: { [key: string]: number } = { A: 4, B: 3, C: 2, D: 1, E: 0 };

  details.forEach((detail) => {
    if (detail.grade && gradeMap[detail.grade] !== undefined) {
      const sks = detail.course.credits;
      const bobot = gradeMap[detail.grade] || 0;
      if (sks) {
        totalSKS += sks;
        totalBobot += bobot * sks;
      }
    }
  });
  return totalSKS > 0 ? (totalBobot / totalSKS).toFixed(2) : "N/A";
};

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;
  const { user, isLoading: isAuthLoading } = useAuthStore(); // Ambil state auth

  const [student, setStudent] = useState<StudentDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Pastikan user adalah Wali sebelum fetch
    if (isAuthLoading || !user || user.role.roleName !== "GUARDIAN") return;

    if (!studentId) return;
    const fetchData = async () => {
      try {
        const response = await api.get(`/guardian-view/student/${studentId}`);
        setStudent(response.data);
      } catch (error) {
        console.error("Gagal mengambil data:", error);
        // Mungkin redirect jika 401/404
        if (
          (error as any).response?.status === 401 ||
          (error as any).response?.status === 404
        ) {
          router.push("/dashboard");
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [studentId, isAuthLoading, user, router]);

  if (isLoading || isAuthLoading) {
    return (
      <div className="flex justify-center mt-10">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  if (!student)
    return (
      <p>Data mahasiswa tidak ditemukan atau Anda tidak memiliki akses.</p>
    );

  return (
    <div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => router.push("/dashboard")}
        className="mb-4"
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        Kembali ke Dashboard Wali
      </Button>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>
            {student.name} ({student.nim})
          </CardTitle>
          <CardDescription>
            {student.studyProgram.level} {student.studyProgram.name} |{" "}
            {student.user.email}
          </CardDescription>
        </CardHeader>
      </Card>

      <h2 className="text-2xl font-bold mb-4">
        Ringkasan Akademik (Read-Only)
      </h2>

      <Accordion type="single" collapsible className="w-full">
        {student.krsHeaders.map((krs) => (
          <AccordionItem value={krs.id.toString()} key={krs.id.toString()}>
            <AccordionTrigger>
              <div className="flex justify-between w-full pr-4">
                <span>
                  {krs.academicYear.year} - {krs.academicYear.semester}
                </span>
                <span>
                  <Badge
                    variant={
                      krs.status === "APPROVED" ? "default" : "secondary"
                    }
                  >
                    {krs.status}
                  </Badge>
                  <span className="ml-4 font-bold">
                    IPS: {calculateIPS(krs.krsDetails)}
                  </span>
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kode MK</TableHead>
                    <TableHead>Nama Mata Kuliah</TableHead>
                    <TableHead>SKS</TableHead>
                    <TableHead>Nilai</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {krs.krsDetails.map((detail, index) => (
                    <TableRow key={`${detail.course.code}-${index}`}>
                      <TableCell>{detail.course.code}</TableCell>
                      <TableCell>{detail.course.name}</TableCell>
                      <TableCell>{detail.course.credits}</TableCell>
                      <TableCell>
                        <Badge variant={detail.grade ? "default" : "outline"}>
                          {detail.grade || "Belum Keluar"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {student.krsHeaders.length === 0 && (
        <p className="text-center text-muted-foreground mt-10">
          Belum ada riwayat KRS untuk ditampilkan.
        </p>
      )}
    </div>
  );
}
