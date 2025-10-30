// 📁 apps/web/app/lecturer/classes/[id]/page.tsx
"use client";

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import api from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

// Definisikan tipe datanya
interface ClassDetails {
  id: bigint;
  name: string;
  course: { name: string; code: string };
}
interface Material { id: bigint; title: string; }
interface Assignment { id: bigint; title: string; deadline: string; }
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

  useEffect(() => {
    if (!classId) return;

    const fetchClassData = async () => {
      try {
        setIsLoading(true);
        // Ambil semua data secara paralel
        const [classRes, materialsRes, assignmentsRes, rosterRes] = await Promise.all([
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
        // Tambahkan toast error nanti
      } finally {
        setIsLoading(false);
      }
    };

    fetchClassData();
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
            <TabsTrigger value="materials">Materi ({materials.length})</TabsTrigger>
            <TabsTrigger value="assignments">Tugas ({assignments.length})</TabsTrigger>
            <TabsTrigger value="students">Mahasiswa ({roster.length})</TabsTrigger>
          </TabsList>

          {/* Tab Materi */}
          <TabsContent value="materials">
            <Button className="mb-4">Tambah Materi Baru</Button>
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
                    <TableCell><Button variant="outline" size="sm">Edit</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          {/* Tab Tugas */}
          <TabsContent value="assignments">
            <Button className="mb-4">Tambah Tugas Baru</Button>
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
                    <TableCell>{new Date(task.deadline).toLocaleString('id-ID')}</TableCell>
                    <TableCell><Button variant="outline" size="sm">Lihat Submission</Button></TableCell>
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
                    <TableCell>{en.student.user.email}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>

      </div>
  );
}