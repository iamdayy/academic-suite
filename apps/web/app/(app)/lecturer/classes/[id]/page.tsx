// 📁 apps/web/app/lecturer/classes/[id]/page.tsx
"use client";

import { AssignmentFormDialog } from "@/components/AssignmentFormDialog";
import { MaterialFormDialog } from "@/components/MaterialFormDialog";
import {
  AlertDialogFooter,
  AlertDialogHeader,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import api from "@/lib/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@radix-ui/react-alert-dialog";
import { Clock, Loader2, PlayCircle, StopCircle, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// Definisikan tipe datanya
interface ClassDetails {
  id: bigint;
  name: string;
  course: { name: string; code: string };
}
interface Material {
  id: bigint;
  title: string;
}
interface Assignment {
  id: bigint;
  title: string;
  deadline: string;
  description: string;
}
interface EnrolledStudent {
  student: { id: bigint; name: string; nim: string; user: { email: string } };
}
interface Schedule {
  id: bigint;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room: string;
}
interface AttendanceSession {
  id: bigint;
  sessionDate: string;
  startTime: string;
  endTime: string;
  status: string;
  notes: string | null;
}
interface ActiveSession {
  id: bigint;
  classScheduleId: bigint;
  status: string;
}

export default function ManageClassPage() {
  const params = useParams();
  const classId = params.id as string;

  // State untuk semua data
  const [classDetails, setClassDetails] = useState<ClassDetails | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [roster, setRoster] = useState<EnrolledStudent[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  const fetchClassData = async () => {
    if (!classId) return;
    try {
      setIsLoading(true);
      const [
        classRes,
        materialsRes,
        assignmentsRes,
        rosterRes,
        schedulesRes,
        activeSessionRes,
        sessionsRes,
      ] = await Promise.all([
        api.get(`/classes/${classId}`),
        api.get(`/materials/class/${classId}`),
        api.get(`/assignments/class/${classId}`),
        api.get(`/class-enrollment/roster/${classId}`),
        api.get(`/class-schedules?classId=${classId}`),
        api.get(`/attendance/session/active/${classId}`),
        api.get(`/attendance/sessions/class/${classId}`),
      ]);
      setClassDetails(classRes.data);
      setMaterials(materialsRes.data);
      setAssignments(assignmentsRes.data);
      setRoster(rosterRes.data);
      setSchedules(schedulesRes.data);
      setSessions(sessionsRes.data);
      setActiveSession(activeSessionRes.data);
    } catch (error) {
      console.error("Gagal mengambil data kelas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMaterial = async (
    materialId: bigint,
    materialTitle: string
  ) => {
    if (
      !confirm(`Apakah Anda yakin ingin menghapus materi "${materialTitle}"?`)
    )
      return;

    try {
      await api.delete(`/materials/${materialId}`);
      toast.success("Berhasil menghapus materi!");
      fetchClassData(); // Refresh data
    } catch (error: any) {
      console.error("Gagal menghapus materi:", error);
      toast.error("Gagal menghapus materi.");
    }
  };

  const handleDeleteAssignment = async (
    assignmentId: bigint,
    assignmentTitle: string
  ) => {
    if (
      !confirm(`Apakah Anda yakin ingin menghapus tugas "${assignmentTitle}"?`)
    )
      return;

    try {
      await api.delete(`/assignments/${assignmentId}`);
      toast.success("Berhasil menghapus tugas!");
      fetchClassData(); // Refresh data
    } catch (error: any) {
      console.error("Gagal menghapus tugas:", error);
      toast.error("Gagal menghapus tugas.");
    }
  };

  const handleOpenSession = async (classScheduleId: bigint) => {
    try {
      await api.post("/attendance/session/open", {
        classScheduleId: Number(classScheduleId),
        notes: `Sesi ${new Date().toLocaleDateString("id-ID")}`,
      });
      toast.success("Berhasil membuka sesi presensi!");
      fetchClassData(); // Refresh data untuk menampilkan sesi aktif
    } catch (error: any) {
      toast.error("Gagal membuka sesi presensi.");
    }
  };

  // 9. Buat fungsi Tutup Sesi
  const handleCloseSession = async (sessionId: bigint) => {
    try {
      await api.patch(`/attendance/session/${sessionId}/close`, {});
      toast.success("Berhasil menutup sesi presensi!");
      fetchClassData(); // Refresh data untuk menghapus sesi aktif
    } catch (error: any) {
      toast.error("Gagal menutup sesi presensi.");
    }
  };

  useEffect(() => {
    if (!classId) return;

    fetchClassData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!classDetails) {
    return <div className="container p-4">Kelas tidak ditemukan.</div>;
  }

  return (
    <main>
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/lecturer/classes">Kelas Saya</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Kelola: {classDetails.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <h1 className="text-3xl font-bold">Kelola Kelas: {classDetails.name}</h1>
      <p className="text-lg text-muted-foreground mb-6">
        {classDetails.course.code} - {classDetails.course.name}
      </p>

      {/* Tabs untuk Materi, Tugas, Mahasiswa */}
      <Tabs defaultValue="materials">
        <TabsList className="mb-4">
          <TabsTrigger value="materials">
            Materi ({materials.length})
          </TabsTrigger>
          <TabsTrigger value="assignments">
            Tugas ({assignments.length})
          </TabsTrigger>
          <TabsTrigger value="students">
            Mahasiswa ({roster.length})
          </TabsTrigger>
          <TabsTrigger value="attendance">Presensi</TabsTrigger>
        </TabsList>

        {/* Tab Materi */}
        <TabsContent value="materials">
          <MaterialFormDialog
            classId={classDetails.id}
            onSuccess={fetchClassData} // <-- Kirim fungsi refresh!
          />
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Judul Materi</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materials.map((mat) => (
                <TableRow key={mat.id.toString()}>
                  <TableCell>{mat.title}</TableCell>
                  <TableCell>
                    {/* Tombol Edit */}
                    <MaterialFormDialog
                      classId={classDetails.id}
                      material={mat} // <-- Kirim data materi = mode Edit
                      onSuccess={fetchClassData}
                    />
                    {/* Tombol Hapus */}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteMaterial(mat.id, mat.title)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        {/* Tab Tugas */}
        <TabsContent value="assignments">
          <AssignmentFormDialog
            classId={classDetails.id}
            onSuccess={fetchClassData} // <-- Kirim fungsi refresh!
          />
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Judul Tugas</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((task) => (
                <TableRow key={task.id.toString()}>
                  <TableCell>{task.title}</TableCell>
                  <TableCell>
                    {new Date(task.deadline).toLocaleString("id-ID")}
                  </TableCell>
                  <TableCell>
                    {/* Tombol Lihat Submission */}
                    <Button variant="outline" size="sm" asChild>
                      <Link
                        href={`/lecturer/classes/${classId}/assignments/${task.id}`}
                      >
                        Lihat Submission
                      </Link>
                    </Button>

                    {/* Tombol Edit */}
                    <AssignmentFormDialog
                      classId={classDetails.id}
                      assignment={task} // <-- Kirim data tugas = mode Edit
                      onSuccess={fetchClassData}
                    />

                    {/* Tombol Hapus */}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() =>
                        handleDeleteAssignment(task.id, task.title)
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        {/* Tab Mahasiswa */}
        <TabsContent value="students">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>NIM</TableHead>
                <TableHead>Nama Mahasiswa</TableHead>
                <TableHead>Email</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roster.map((en) => (
                <TableRow key={en.student.id.toString()}>
                  <TableCell>{en.student.nim}</TableCell>
                  <TableCell>{en.student.name}</TableCell>
                  <TableCell>{en.student.user?.email}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
        {/* Tab Presensi */}
        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle>Manajemen Presensi</CardTitle>
              <CardDescription>
                Buka sesi presensi berdasarkan jadwal kelas. Sesi akan otomatis
                tertutup setelah 15 menit, atau Anda bisa menutupnya manual.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activeSession && (
                <Card className="mb-6 bg-blue-900 border-blue-700">
                  <CardHeader>
                    <CardTitle className="text-white">
                      Sesi Sedang Berlangsung!
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-blue-200 mb-4">
                      Sesi presensi sedang DIBUKA. Mahasiswa dapat melakukan
                      presensi sekarang.
                    </p>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                          <StopCircle className="mr-2 h-4 w-4" /> Tutup Sesi
                          Sekarang
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Tutup Sesi?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Apakah Anda yakin ingin menutup sesi presensi ini?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleCloseSession(activeSession.id)}
                          >
                            Ya, Tutup Sesi
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardContent>
                </Card>
              )}

              <h3 className="text-lg font-semibold mb-4">
                Jadwal Kelas Terdaftar
              </h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hari</TableHead>
                    <TableHead>Waktu</TableHead>
                    <TableHead>Ruangan</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedules.map((sch) => (
                    <TableRow key={sch.id.toString()}>
                      <TableCell>{sch.dayOfWeek}</TableCell>
                      <TableCell>
                        {sch.startTime} - {sch.endTime}
                      </TableCell>
                      <TableCell>{sch.room}</TableCell>
                      <TableCell className="text-right">
                        {activeSession ? (
                          <Button size="sm" disabled>
                            <Clock className="mr-2 h-4 w-4" /> Sesi Lain Aktif
                          </Button>
                        ) : (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                <PlayCircle className="mr-2 h-4 w-4" /> Buka
                                Sesi
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Buka Sesi Presensi?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Anda akan membuka sesi untuk: <br />
                                  {sch.dayOfWeek}, {sch.startTime}-{sch.endTime}{" "}
                                  di {sch.room}.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleOpenSession(sch.id)}
                                >
                                  Ya, Buka Sesi
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <h3 className="text-lg font-semibold mb-4 mt-6">Riwayat Sesi</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Waktu</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Catatan</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.map((session) => (
                    <TableRow key={session.id.toString()}>
                      <TableCell>
                        {new Date(session.sessionDate).toLocaleDateString(
                          "id-ID"
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(session.startTime).toLocaleTimeString(
                          "id-ID"
                        )}{" "}
                        -{" "}
                        {new Date(session.endTime).toLocaleTimeString("id-ID")}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            session.status === "OPEN" ? "default" : "secondary"
                          }
                        >
                          {session.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{session.notes}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" asChild>
                          <Link
                            href={`/lecturer/classes/${classId}/attendance/${session.id}`}
                          >
                            Kelola Presensi
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
