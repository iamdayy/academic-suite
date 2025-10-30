// 📁 .../admin/academics/[majorId]/[prodiId]/[curriculumId]/[courseId]/page.tsx
"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"; // <-- Impor Breadcrumb
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import api from '@/lib/api';
import { Loader2, PlusCircle, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { toast } from "sonner";

// Definisikan tipe datanya
interface Prerequisite {
  id: bigint; // ID dari baris 'prerequisite'
  prerequisiteCourse: {
    id: bigint;
    code: string;
    name: string;
  };
}
interface Course {
  id: bigint;
  code: string;
  name: string;
  prerequisites: Prerequisite[]; // Daftar prasyarat yang sudah ada
}
interface AllCourses {
  id: bigint;
  name: string;
  code: string;
}

export default function ManagePrerequisitesPage() {
  const params = useParams();
  const router = useRouter();
  const { majorId, studyProgramId:prodiId, curriculumId, courseId } = params;

  const [course, setCourse] = useState<Course | null>(null);
  const [allCourses, setAllCourses] = useState<AllCourses[]>([]); // Untuk dropdown
  const [isLoading, setIsLoading] = useState(true);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPrerequisiteId, setSelectedPrerequisiteId] = useState("");

  const fetchData = async () => {
    if (!courseId) return;
    try {
      setIsLoading(true);
      const [courseRes, allCoursesRes] = await Promise.all([
        api.get(`/courses/${courseId}`),
        api.get('/courses'),
      ]);
      setCourse(courseRes.data);
      setAllCourses(allCoursesRes.data);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [courseId]);

  // Handle Submit Prasyarat
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedPrerequisiteId) return;
    setIsSubmitting(true);
    try {
      await api.post(`/courses/${courseId}/prerequisite`, {
        prerequisiteCourseId: Number(selectedPrerequisiteId),
      });
      toast.success("Prasyarat berhasil ditambahkan.");
      setIsDialogOpen(false);
      setSelectedPrerequisiteId("");
      fetchData(); // Refresh data
    } catch (error: any) {
      console.error("Gagal menambah prasyarat:", error);
      toast.error(error.response.data.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Hapus Prasyarat
  const handleDelete = async (prerequisiteRowId: bigint) => {
    if (!confirm("Apakah Anda yakin ingin menghapus prasyarat ini?")) return;

    try {
      // Panggil API DELETE yang baru kita buat
      await api.delete(`/prerequisites/${prerequisiteRowId}`);
      toast.success("Prasyarat berhasil dihapus.");
      fetchData(); // Refresh data
    } catch (error: any) {
      console.error("Gagal menghapus prasyarat:", error);
      toast.error(error.response.data.message);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center mt-10"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  if (!course) return <p>Mata kuliah tidak ditemukan.</p>;

  return (
    <div>
      {/* --- BREADCRUMB --- */}
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild><Link href="/admin/academics">Jurusan</Link></BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild><Link href={`/admin/academics/${majorId}`}>Prodi</Link></BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild><Link href={`/admin/academics/${majorId}/${prodiId}`}>Kurikulum</Link></BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild><Link href={`/admin/academics/${majorId}/${prodiId}/${curriculumId}`}>MatKul</Link></BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Prasyarat</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      {/* ----------------- */}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Kelola Prasyarat: {course.name} ({course.code})</CardTitle>
        </CardHeader>
      </Card>

      {/* Dialog Tambah Prasyarat */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Daftar Prasyarat</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button><PlusCircle className="mr-2 h-4 w-4" /> Tambah Prasyarat</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Tambah Prasyarat untuk {course.name}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Label htmlFor="prerequisite">Mata Kuliah Prasyarat</Label>
                <Select value={selectedPrerequisiteId} onValueChange={setSelectedPrerequisiteId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Mata Kuliah..." />
                  </SelectTrigger>
                  <SelectContent>
                    {allCourses
                      .filter(c => c.id !== course.id) // Filter diri sendiri
                      .map((c) => (
                      <SelectItem key={c.id.toString()} value={c.id.toString()}>
                        {c.code} - {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <DialogClose asChild><Button type="button" variant="secondary">Batal</Button></DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Simpan
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabel Daftar Prasyarat */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Kode</TableHead>
            <TableHead>Nama Mata Kuliah</TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {course.prerequisites.map((pre) => (
            <TableRow key={pre.id.toString()}>
              <TableCell>{pre.prerequisiteCourse.code}</TableCell>
              <TableCell>{pre.prerequisiteCourse.name}</TableCell>
              <TableCell>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleDelete(pre.id)} // <-- Tambah Aksi Hapus
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {course.prerequisites.length === 0 && (
        <p className="text-center text-muted-foreground mt-4">
          Mata kuliah ini tidak memiliki prasyarat.
        </p>
      )}
    </div>
  );
}