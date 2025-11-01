// 📁 apps/web/app/(app)/admin/academic-years/[yearId]/page.tsx
"use client";

import { EditClassDialog } from "@/components/dialogs/EditClassDialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
import api from "@/lib/api";
import { ChevronLeft, Loader2, PlusCircle, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

// Definisikan tipe data
interface AcademicYear {
  id: bigint;
  year: string;
  semester: string;
}
interface Class {
  id: bigint;
  name: string;
  course: { id: bigint; name: string; code: string };
  lecturer: { id: bigint; name: string };
}
// Tipe untuk dropdown
interface Course {
  id: bigint;
  name: string;
  code: string;
}
interface Lecturer {
  id: bigint;
  name: string;
}

export default function AcademicYearDetailPage() {
  const params = useParams();
  const router = useRouter();
  const yearId = params.yearId as string;

  // State untuk data
  const [year, setYear] = useState<AcademicYear | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State untuk dialog form
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newName, setNewName] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedLecturerId, setSelectedLecturerId] = useState("");

  // Fungsi untuk mengambil data
  const fetchData = async () => {
    if (!yearId) return;
    try {
      setIsLoading(true);
      // Ambil 4 data sekaligus
      const [yearRes, classesRes, coursesRes, lecturersRes] = await Promise.all(
        [
          api.get(`/academic-years/${yearId}`),
          api.get(`/classes?academicYearId=${yearId}`), // <-- Filter kelas
          api.get("/courses"), // <-- Untuk dropdown
          api.get("/lecturers"), // <-- Untuk dropdown
        ]
      );
      setYear(yearRes.data);
      setClasses(classesRes.data);
      setCourses(coursesRes.data);
      setLecturers(lecturersRes.data);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
      toast.error("Terjadi kesalahan saat mengambil data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [yearId]);

  // Fungsi untuk submit form Kelas
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId || !selectedLecturerId || !newName) {
      toast.error("Semua field harus diisi.");
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post("/classes", {
        name: newName,
        courseId: Number(selectedCourseId),
        lecturerId: Number(selectedLecturerId),
        academicYearId: Number(yearId), // Ambil dari URL
      });
      toast.success("Kelas berhasil dibuka.");
      setIsDialogOpen(false);
      setNewName("");
      setSelectedCourseId("");
      setSelectedLecturerId("");
      fetchData(); // Refresh tabel
    } catch (error: any) {
      console.error("Gagal membuka kelas:", error);
      toast.error("Terjadi kesalahan saat membuka kelas.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClass = async (classId: bigint, className: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus kelas "${className}"?`)) {
      return;
    }

    try {
      await api.delete(`/classes/${classId}`); // API ini sudah ada
      toast.success("Kelas berhasil dihapus.");
      fetchData(); // Refresh tabel
    } catch (error: any) {
      console.error("Gagal menghapus kelas:", error);
      toast.error("Terjadi kesalahan saat menghapus kelas.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center mt-10">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  if (!year) return <p>Tahun Ajaran tidak ditemukan.</p>;

  return (
    <div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => router.push("/admin/academic-years")}
        className="mb-4"
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        Kembali ke Daftar Tahun Ajaran
      </Button>

      {/* Card Detail Tahun Ajaran (Induk) */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>
            Tahun Ajaran: {year.year} ({year.semester})
          </CardTitle>
          <CardDescription>
            Kelola semua kelas yang dibuka di semester ini.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Bagian Tabel Kelas (Anak) */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Daftar Kelas</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Buka Kelas Baru
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Buka Kelas Baru</DialogTitle>
                <DialogDescription>
                  T.A: {year.year} ({year.semester})
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {/* Select Mata Kuliah */}
                <div className="space-y-2">
                  <Label htmlFor="course">Mata Kuliah</Label>
                  <Select
                    value={selectedCourseId}
                    onValueChange={setSelectedCourseId}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Mata Kuliah" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem
                          key={course.id.toString()}
                          value={course.id.toString()}
                        >
                          {course.code} - {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* Select Dosen */}
                <div className="space-y-2">
                  <Label htmlFor="lecturer">Dosen Pengajar</Label>
                  <Select
                    value={selectedLecturerId}
                    onValueChange={setSelectedLecturerId}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Dosen" />
                    </SelectTrigger>
                    <SelectContent>
                      {lecturers.map((lecturer) => (
                        <SelectItem
                          key={lecturer.id.toString()}
                          value={lecturer.id.toString()}
                        >
                          {lecturer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* Input Nama Kelas */}
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Kelas</Label>
                  <Input
                    id="name"
                    placeholder="Kelas A, Kelas Pagi..."
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    Batal
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Simpan
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Nama Kelas</TableHead>
            <TableHead>Mata Kuliah</TableHead>
            <TableHead>Dosen</TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {classes.map((cls) => (
            <TableRow key={cls.id.toString()}>
              <TableCell>{cls.id.toString()}</TableCell>
              <TableCell className="font-medium">{cls.name}</TableCell>
              <TableCell>{cls.course.name}</TableCell>
              <TableCell>{cls.lecturer.name}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/admin/academic-years/${yearId}/${cls.id}`}>
                    Kelola Roster
                  </Link>
                </Button>
                <EditClassDialog
                  classToEdit={cls}
                  courses={courses} // Kirim daftar courses
                  lecturers={lecturers} // Kirim daftar lecturers
                  onSuccess={fetchData}
                />

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteClass(cls.id, cls.name)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
