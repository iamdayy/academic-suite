// 📁 apps/web/app/(app)/lecturer/classes/[id]/assignments/[assignmentId]/page.tsx
"use client";

import ClientAuthGuard from '@/components/ClientAuthGuard';
import { GradeSubmissionDialog } from '@/components/GradeSubmissionDialog';
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
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
import api from '@/lib/api';
import { ChevronLeft, Download, Loader2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

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
        api.get(`/assignment-submissions/assignment/${assignmentId}`)
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
    return new Date(dateString).toLocaleString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
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
        <Button variant="outline" size="sm" onClick={() => router.push(`/lecturer/classes/${classId}`)} className="mb-4">
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
        <h2 className="text-2xl font-bold mb-4">Daftar Pengumpulan</h2>
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
                    <a href={sub.fileUrl} target="_blank" rel="noopener noreferrer">
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