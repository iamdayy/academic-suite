// 📁 apps/web/app/lecturer/classes/[id]/page.tsx
"use client";

import { AssignmentFormDialog } from "@/components/AssignmentFormDialog";
import { MaterialFormDialog } from "@/components/MaterialFormDialog";
import { Button } from "@/components/ui/button";
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
import { Loader2, Trash2 } from "lucide-react";
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

export default function ManageClassPage() {
  const params = useParams();
  const classId = params.id as string;

  // State untuk semua data
  const [classDetails, setClassDetails] = useState<ClassDetails | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [roster, setRoster] = useState<EnrolledStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchClassData = async () => {
    if (!classId) return;
    try {
      setIsLoading(true);
      const [classRes, materialsRes, assignmentsRes, rosterRes] =
        await Promise.all([
          api.get(`/classes/${classId}`),
          api.get(`/materials/class/${classId}`),
          api.get(`/assignments/class/${classId}`),
          api.get(`/class-enrollment/roster/${classId}`),
        ]);
      setClassDetails(classRes.data);
      setMaterials(materialsRes.data);
      setAssignments(assignmentsRes.data);
      setRoster(rosterRes.data);
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
    <div>
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
      </Tabs>
    </div>
  );
}
