// 📁 .../attendance/[sessionId]/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import api from "@/lib/api";
import { Check, ChevronLeft, Loader2, Minus, X } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

// Definisikan tipe data
interface RosterStudent {
  id: bigint;
  name: string;
  nim: string;
}
interface AttendanceRecord {
  id: bigint;
  studentId: bigint;
  status: string;
}

export default function ManageAttendancePage() {
  const params = useParams();
  const router = useRouter();
  const { id: classId, sessionId } = params;

  const [roster, setRoster] = useState<RosterStudent[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!classId || !sessionId) return;
    try {
      const [rosterRes, recordsRes] = await Promise.all([
        api.get(`/class-enrollment/roster/${classId}`),
        api.get(`/attendance/session/${sessionId}/records`),
      ]);
      setRoster(rosterRes.data.map((r: any) => r.student));
      setRecords(recordsRes.data);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
      toast.error("Gagal mengambil data.");
    } finally {
      setIsLoading(false);
    }
  }, [classId, sessionId, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Gabungkan Roster dan Rekaman Presensi
  const mergedData = roster.map((student) => {
    const record = records.find((r) => r.studentId === student.id);
    return {
      ...student,
      status: record ? record.status : null,
    };
  });

  // Handle Dosen mengubah status
  const handleSetStatus = async (studentId: bigint, status: string) => {
    try {
      await api.post("/attendance/record-manual", {
        sessionId: Number(sessionId),
        studentId: Number(studentId),
        status: status,
      });
      toast.success("Berhasil mengubah status!");
      fetchData(); // Refresh data
    } catch (error: any) {
      toast.error("Gagal mengubah status.");
    }
  };

  const getStatusIcon = (status: string | null) => {
    if (status === "HADIR") return <Check className="h-5 w-5 text-green-500" />;
    if (status === "IZIN") return <Minus className="h-5 w-5 text-yellow-500" />;
    if (status === "SAKIT")
      return <Minus className="h-5 w-5 text-orange-500" />;
    if (status === "ALPA") return <X className="h-5 w-5 text-red-500" />;
    return <span className="text-muted-foreground">Belum Absen</span>;
  };

  if (isLoading) {
    return <Loader2 className="h-8 w-8 animate-spin" />;
  }

  return (
    <div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => router.push(`/lecturer/classes/${classId}`)}
        className="mb-4"
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        Kembali ke Detail Kelas
      </Button>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Kelola Presensi</CardTitle>
          <CardDescription>
            Daftar hadir mahasiswa untuk sesi ini. Anda dapat mengubah status
            secara manual.
          </CardDescription>
        </CardHeader>
      </Card>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>NIM</TableHead>
            <TableHead>Nama Mahasiswa</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Aksi (Manual Override)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mergedData.map((student) => (
            <TableRow key={student.id.toString()}>
              <TableCell>{student.nim}</TableCell>
              <TableCell className="font-medium">{student.name}</TableCell>
              <TableCell>{getStatusIcon(student.status)}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Ubah Status
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={() => handleSetStatus(student.id, "HADIR")}
                    >
                      HADIR
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleSetStatus(student.id, "IZIN")}
                    >
                      IZIN
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleSetStatus(student.id, "SAKIT")}
                    >
                      SAKIT
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleSetStatus(student.id, "ALPA")}
                    >
                      ALPA
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
