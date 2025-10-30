// 📁 apps/web/app/assignments/page.tsx
"use client";

import { SubmissionDialog } from '@/components/SubmissionDialog';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import api from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Submission {
  id: bigint;
  grade: number | null;
  submittedAt: string;
}

// Definisikan tipe datanya
interface Assignment {
  id: bigint;
  title: string;
  deadline: string; // Ini akan jadi string ISO
  class: {
    name: string;
  };
  submissions: Submission[];
}

export default function MyAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMyAssignments = async () => {
    try {
      // 1. Panggil endpoint baru kita
      const response = await api.get('/assignments/my');
      setAssignments(response.data);
    } catch (error) {
      console.error("Gagal mengambil data tugas:", error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {

    fetchMyAssignments();
  }, []);

  // Helper untuk format tanggal
  const formatDeadline = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 4. Buat helper untuk render tombol Aksi
  const renderActionCell = (task: Assignment) => {
    const submission = task.submissions[0]; // Ambil submission (jika ada)

    if (submission) {
      // KASUS 1: Sudah mengumpulkan
      if (submission.grade !== null) {
        // Sudah dinilai
        return (
          <Badge variant="default" className="text-lg">
            Nilai: {submission.grade}
          </Badge>
        );
      } else {
        // Sudah kumpul, belum dinilai
        return (
          <Badge variant="secondary">
            Terkumpul (Belum Dinilai)
          </Badge>
        );
      }
    } else {
      // KASUS 2: Belum mengumpulkan
      // TODO: Cek jika sudah lewat deadline
      return (
        <SubmissionDialog 
          assignmentId={task.id} 
          assignmentTitle={task.title}
          // Kirim callback untuk me-refresh data setelah submit
          onSuccess={fetchMyAssignments} 
        />
      );
    }
  };

  return (
      <div>
        <h1 className="text-3xl font-bold mb-6">Tugas Saya</h1>

        {isLoading ? (
          <div className="flex justify-center mt-10">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mata Kuliah / Kelas</TableHead>
                <TableHead>Judul Tugas</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((task) => (
                <TableRow key={task.id.toString()}>
                  <TableCell>{task.class.name}</TableCell>
                  <TableCell>{task.title}</TableCell>
                  <TableCell>{formatDeadline(task.deadline)}</TableCell>
                  <TableCell>
                    {renderActionCell(task)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {!isLoading && assignments.length === 0 && (
          <p className="text-center text-muted-foreground mt-10">
            Anda tidak memiliki tugas saat ini.
          </p>
        )}
      </div>
  );
}