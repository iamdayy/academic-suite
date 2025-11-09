// 📁 apps/web/app/(app)/admin/academic-years/[yearId]/[classId]/page.tsx
"use client";

import { ScheduleFormDialog } from "@/components/dialogs/ScheduleFormDialog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { Link, Loader2, Trash2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
// import { ConnectStudentDialog } from '@/components/dialogs/ConnectStudentDialog'; // <-- Kita pakai ulang komponen ini!

// Definisikan tipe data
interface Class {
  id: bigint;
  name: string;
  course: { name: string };
  lecturer: { name: string };
}
interface Student {
  id: bigint;
  name: string;
  nim: string;
}
interface RosterEntry {
  id: bigint; // ID dari baris ClassStudent
  student: Student;
}

interface Schedule {
  id: bigint;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room: string;
}

export default function RosterPage() {
  const params = useParams();
  const { yearId, classId } = params;

  const [cls, setCls] = useState<Class | null>(null);
  const [roster, setRoster] = useState<RosterEntry[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    if (!classId) return;
    try {
      setIsLoading(true);
      const [classRes, rosterRes, schedulesRes] = await Promise.all([
        api.get(`/classes/${classId}`),
        api.get(`/class-enrollment/roster/${classId}`),
        api.get(`/class-schedules?classId=${classId}`),
      ]);
      setCls(classRes.data);
      setRoster(rosterRes.data);
      setSchedules(schedulesRes.data);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
      toast.error("Terjadi kesalahan saat mengambil data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [classId]);

  // Handle Hapus (Keluarkan Mahasiswa dari Roster)
  const handleDelete = async (enrollmentId: bigint) => {
    if (!confirm("Yakin ingin mengeluarkan mahasiswa ini dari kelas?")) return;
    try {
      await api.delete(`/class-enrollment/${enrollmentId}`);
      toast.success("Mahasiswa berhasil dikeluarkan.");
      fetchData(); // Refresh tabel
    } catch (error: any) {
      console.error("Gagal menghapus:", error);
      toast.error("Terjadi kesalahan saat menghapus mahasiswa.");
    }
  };

  const handleDeleteSchedule = async (scheduleId: bigint) => {
    if (!confirm("Yakin ingin menghapus jadwal ini?")) return;
    try {
      await api.delete(`/class-schedules/${scheduleId}`);
      toast.success("Jadwal berhasil dihapus.");
      fetchData(); // Refresh data
    } catch (error: any) {
      console.error("Gagal menghapus jadwal:", error);
      toast.error("Terjadi kesalahan saat menghapus jadwal.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center mt-10">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  if (!cls) return <p>Kelas tidak ditemukan.</p>;

  return (
    <main>
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/admin/academic-years">Tahun Ajaran</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/admin/academic-years/${yearId}`}>Kelola Kelas</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Kelola Roster</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Card Detail Kelas (Induk) */}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Roster Kelas: {cls.name}</CardTitle>
          <CardDescription>
            {cls.course.name} - Diajar oleh: {cls.lecturer.name}
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="roster" className="mt-6">
        <TabsList className="mb-4">
          <TabsTrigger value="roster">
            Daftar Mahasiswa ({roster.length})
          </TabsTrigger>
          <TabsTrigger value="schedules">
            Jadwal Kelas ({schedules.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="roster">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">
              Daftar Mahasiswa ({roster.length})
            </h2>
          </div>

          <p className="text-muted-foreground mb-4">
            Daftar ini diisi secara otomatis ketika Anda menyetujui (APPROVE)
            KRS mahasiswa.
          </p>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>NIM</TableHead>
                <TableHead>Nama Mahasiswa</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roster.map((entry) => (
                <TableRow key={entry.id.toString()}>
                  <TableCell>{entry.student.nim}</TableCell>
                  <TableCell className="font-medium">
                    {entry.student.name}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(entry.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
        <TabsContent value="schedules">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Jadwal Kelas</h2>
            <ScheduleFormDialog classId={cls.id} onSuccess={fetchData} />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hari</TableHead>
                <TableHead>Jam Mulai</TableHead>
                <TableHead>Jam Selesai</TableHead>
                <TableHead>Ruangan</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedules.map((sch) => (
                <TableRow key={sch.id.toString()}>
                  <TableCell className="font-medium">{sch.dayOfWeek}</TableCell>
                  <TableCell>{sch.startTime}</TableCell>
                  <TableCell>{sch.endTime}</TableCell>
                  <TableCell>{sch.room}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <ScheduleFormDialog
                      classId={cls.id}
                      schedule={sch}
                      onSuccess={fetchData}
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteSchedule(sch.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </main>
  );
}
