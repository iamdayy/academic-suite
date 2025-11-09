// 📁 apps/web/app/(app)/lecturer/classes/[id]/assignments/[assignmentId]/page.tsx
"use client";

import ClientAuthGuard from "@/components/ClientAuthGuard";
import { GradeSubmissionDialog } from "@/components/GradeSubmissionDialog";
import { Badge } from "@/components/ui/badge";
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
import { ChevronLeft, Download, FileDown, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";

// Definisikan tipe datanya
interface AssignmentDetails {
  id: bigint;
  title: string;
  description: string;
  deadline: string;
}
interface Submission {
  id: bigint;
  fileUrl: string;
  submittedAt: string;
  grade: number | null;
  student: {
    id: bigint;
    name: string;
    nim: string;
  };
}

export default function AssignmentSubmissionsPage() {
  const params = useParams();
  const router = useRouter();
  const assignmentId = params.assignmentId as string;
  const classId = params.id as string; // Ambil classId dari URL

  const [assignment, setAssignment] = useState<AssignmentDetails | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const fetchData = async () => {
    if (!assignmentId) return;
    try {
      setIsLoading(true); // Set loading setiap kali fetch
      const [assignmentRes, submissionsRes] = await Promise.all([
        api.get(`/assignments/${assignmentId}`),
        api.get(`/assignment-submissions/assignment/${assignmentId}`),
      ]);
      setAssignment(assignmentRes.data);
      setSubmissions(submissionsRes.data);
    } catch (error) {
      console.error("Gagal mengambil data submission:", error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (!assignmentId) return;
    fetchData();
  }, [assignmentId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleExport = () => {
    if (!assignment || !submissions) return;

    // A. Siapkan data untuk di-export
    const dataToExport = submissions.map((sub) => {
      return {
        NIM: sub.student.nim,
        "Nama Mahasiswa": sub.student.name,
        "Waktu Kumpul": formatDate(sub.submittedAt),
        Nilai: sub.grade ?? "Belum Dinilai",
        "URL File": sub.fileUrl,
      };
    });

    // B. Buat Worksheet (lembar kerja)
    const ws = XLSX.utils.json_to_sheet(dataToExport);

    // C. Buat Workbook (file)
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Daftar Nilai"); // Nama sheet

    // D. Trigger download di browser
    const fileName = `Nilai - ${assignment.title.replace(/ /g, "_")}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!assignment) {
    return <p>Tugas tidak ditemukan.</p>;
  }

  return (
    <ClientAuthGuard>
      <main>
        {/* Tombol Kembali */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/lecturer/classes/${classId}`)}
          className="mb-4"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Kembali ke Detail Kelas
        </Button>

        {/* Detail Tugas */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Submissions: {assignment.title}</CardTitle>
            <CardDescription>
              Deadline: {formatDate(assignment.deadline)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>{assignment.description}</p>
          </CardContent>
        </Card>

        {/* Tabel Submissions */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">
            Daftar Pengumpulan ({submissions.length})
          </h2>
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={submissions.length === 0}
          >
            <FileDown className="mr-2 h-4 w-4" />
            Export ke Excel
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>NIM</TableHead>
              <TableHead>Nama Mahasiswa</TableHead>
              <TableHead>Waktu Kumpul</TableHead>
              <TableHead>File</TableHead>
              <TableHead>Nilai</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions.map((sub) => (
              <TableRow key={sub.id.toString()}>
                <TableCell>{sub.student.nim}</TableCell>
                <TableCell>{sub.student.name}</TableCell>
                <TableCell>{formatDate(sub.submittedAt)}</TableCell>
                <TableCell>
                  <Button variant="link" asChild className="p-0">
                    <a
                      href={sub.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="h-4 w-4 mr-2" /> Unduh
                    </a>
                  </Button>
                </TableCell>
                <TableCell>
                  {sub.grade !== null ? (
                    <Badge>{sub.grade}</Badge>
                  ) : (
                    <Badge variant="secondary">Belum Dinilai</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <GradeSubmissionDialog
                    submissionId={sub.id}
                    studentName={sub.student.name}
                    currentGrade={sub.grade}
                    onSuccess={fetchData}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {submissions.length === 0 && (
          <p className="text-center text-muted-foreground mt-10">
            Belum ada mahasiswa yang mengumpulkan.
          </p>
        )}
      </main>
    </ClientAuthGuard>
  );
}
