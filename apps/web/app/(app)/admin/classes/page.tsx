// 📁 apps/web/app/admin/classes/page.tsx
"use client";

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
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
import api from '@/lib/api';
import { Loader2, PlusCircle } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { toast } from "sonner";

// 1. Definisikan tipe data untuk dropdowns & tabel
interface Course {
  id: bigint;
  name: string;
  code: string;
}
interface Lecturer {
  id: bigint;
  name: string;
  nidn: string;
}
interface AcademicYear {
  id: bigint;
  year: string;
  semester: string;
}
interface Class {
  id: bigint;
  name: string;
  course: Course;
  lecturer: Lecturer;
  academicYear: AcademicYear;
}

export default function ClassesPage() {
  // 2. State untuk data
  const [classes, setClasses] = useState<Class[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 3. State untuk dialog form
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 4. State untuk form input
  const [newName, setNewName] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedLecturerId, setSelectedLecturerId] = useState("");
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState("");

  // 5. Fungsi untuk mengambil SEMUA data
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [classesRes, coursesRes, lecturersRes, academicYearsRes] = await Promise.all([
        api.get('/classes'),
        api.get('/courses'),
        api.get('/lecturers'),
        api.get('/academic-years'),
      ]);
      setClasses(classesRes.data);
      setCourses(coursesRes.data);
      setLecturers(lecturersRes.data);
      setAcademicYears(academicYearsRes.data);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
      toast.error('Terjadi kesalahan saat mengambil data.');
    } finally {
      setIsLoading(false);
    }
  };

  // 6. Ambil data saat komponen dimuat
  useEffect(() => {
    fetchData();
  }, []);

  // 7. Fungsi untuk submit form
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId || !selectedLecturerId || !selectedAcademicYearId || !newName) {
      toast.error('Mohon isi semua field.');
      return;
    }
    setIsSubmitting(true);

    try {
      await api.post('/classes', {
        name: newName,
        courseId: Number(selectedCourseId),
        lecturerId: Number(selectedLecturerId),
        academicYearId: Number(selectedAcademicYearId),
      });
      toast.success('Kelas berhasil ditambahkan.');

      setIsDialogOpen(false); // Tutup dialog
      // Reset form
      setNewName("");
      setSelectedCourseId("");
      setSelectedLecturerId("");
      setSelectedAcademicYearId("");
      fetchData(); // Ambil ulang data

    } catch (error: any) {
      console.error("Gagal menambah kelas:", error);
      toast.error('Terjadi kesalahan saat menambah kelas.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manajemen Kelas</h1>

        {/* 8. Tombol & Dialog untuk Tambah Baru */}
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
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {/* Select Mata Kuliah */}
                <div className="space-y-2">
                  <Label htmlFor="course">Mata Kuliah</Label>
                  <Select value={selectedCourseId} onValueChange={setSelectedCourseId} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Mata Kuliah" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id.toString()} value={course.id.toString()}>
                          {course.code} - {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* Select Dosen */}
                <div className="space-y-2">
                  <Label htmlFor="lecturer">Dosen Pengajar</Label>
                  <Select value={selectedLecturerId} onValueChange={setSelectedLecturerId} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Dosen" />
                    </SelectTrigger>
                    <SelectContent>
                      {lecturers.map((lecturer) => (
                        <SelectItem key={lecturer.id.toString()} value={lecturer.id.toString()}>
                          {lecturer.name} ({lecturer.nidn})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* Select Tahun Ajaran */}
                <div className="space-y-2">
                  <Label htmlFor="academicYear">Tahun Ajaran</Label>
                  <Select value={selectedAcademicYearId} onValueChange={setSelectedAcademicYearId} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Tahun Ajaran" />
                    </SelectTrigger>
                    <SelectContent>
                      {academicYears.map((year) => (
                        <SelectItem key={year.id.toString()} value={year.id.toString()}>
                          {year.year} - {year.semester}
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
                    placeholder="Kelas A, Kelas B, Kelas Pagi..."
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
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Simpan
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* 9. Tampilkan Tabel Data atau Loading */}
      {isLoading ? (
        <div className="flex justify-center mt-10">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Nama Kelas</TableHead>
              <TableHead>Mata Kuliah</TableHead>
              <TableHead>Dosen</TableHead>
              <TableHead>T.A.</TableHead>
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
                <TableCell>{cls.academicYear.year} ({cls.academicYear.semester})</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}