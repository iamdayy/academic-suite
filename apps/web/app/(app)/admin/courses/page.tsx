// 📁 apps/web/app/admin/courses/page.tsx
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

// 1. Definisikan tipe data
interface Curriculum {
  id: bigint;
  name: string;
  year: number;
}
interface Course {
  id: bigint;
  code: string;
  name: string;
  credits: number;
  semester: number;
  curriculum: {
    name: string; // Kita include nama kurikulum
  };
}

export default function CoursesPage() {
  // 2. State untuk data
  const [courses, setCourses] = useState<Course[]>([]);
  const [curriculums, setCurriculums] = useState<Curriculum[]>([]); // Untuk dropdown
  const [isLoading, setIsLoading] = useState(true);

  // 3. State untuk dialog form
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 4. State untuk form input
  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [newCredits, setNewCredits] = useState("");
  const [newSemester, setNewSemester] = useState("");
  const [selectedCurriculumId, setSelectedCurriculumId] = useState("");

  // 5. Fungsi untuk mengambil SEMUA data
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [coursesRes, curriculumsRes] = await Promise.all([
        api.get('/courses'),
        api.get('/curriculums') // API ini sudah kita buat
      ]);
      setCourses(coursesRes.data);
      setCurriculums(curriculumsRes.data);
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
    if (!selectedCurriculumId || !newName || !newCode || !newCredits || !newSemester) {
        toast.error('Mohon isi semua field.');
        return;
    }
    if (isNaN(Number(newCredits)) || isNaN(Number(newSemester))) {
        toast.error('SKS dan Semester harus berupa angka.')
      return;
    }
    setIsSubmitting(true);

    try {
      await api.post('/courses', {
        code: newCode,
        name: newName,
        credits: Number(newCredits), // Konversi ke number
        semester: Number(newSemester), // Konversi ke number
        curriculumId: Number(selectedCurriculumId), // Konversi ke number
      });
      toast.success('Mata Kuliah berhasil ditambahkan.');
      setIsDialogOpen(false); // Tutup dialog
      // Reset form
      setNewCode("");
      setNewName("");
      setNewCredits("");
      setNewSemester("");
      setSelectedCurriculumId("");
      fetchData(); // Ambil ulang data

    } catch (error: any) {
      console.error("Gagal menambah mata kuliah:", error);
      toast.error('Terjadi kesalahan saat menambah mata kuliah.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manajemen Mata Kuliah</h1>

        {/* 8. Tombol & Dialog untuk Tambah Baru */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Tambah Mata Kuliah
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Tambah Mata Kuliah Baru</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {/* Select Kurikulum */}
                <div className="space-y-2">
                  <Label htmlFor="curriculum">Kurikulum</Label>
                  <Select value={selectedCurriculumId} onValueChange={setSelectedCurriculumId} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Kurikulum" />
                    </SelectTrigger>
                    <SelectContent>
                      {curriculums.map((cur) => (
                        <SelectItem key={cur.id.toString()} value={cur.id.toString()}>
                          {cur.name} ({cur.year})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* Input Kode MK */}
                <div className="space-y-2">
                  <Label htmlFor="code">Kode MK</Label>
                  <Input
                    id="code"
                    placeholder="IF101"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    required
                  />
                </div>
                {/* Input Nama MK */}
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Mata Kuliah</Label>
                  <Input
                    id="name"
                    placeholder="Dasar Pemrograman"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                  />
                </div>
                {/* Input SKS & Semester */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="credits">SKS</Label>
                    <Input
                      id="credits"
                      type="number"
                      placeholder="3"
                      value={newCredits}
                      onChange={(e) => setNewCredits(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="semester">Semester</Label>
                    <Input
                      id="semester"
                      type="number"
                      placeholder="1"
                      value={newSemester}
                      onChange={(e) => setNewSemester(e.target.value)}
                      required
                    />
                  </div>
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
              <TableHead>Kode</TableHead>
              <TableHead>Nama Mata Kuliah</TableHead>
              <TableHead>SKS</TableHead>
              <TableHead>Sem</TableHead>
              <TableHead>Kurikulum</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((course) => (
              <TableRow key={course.id.toString()}>
                <TableCell>{course.id.toString()}</TableCell>
                <TableCell>{course.code}</TableCell>
                <TableCell className="font-medium">{course.name}</TableCell>
                <TableCell>{course.credits}</TableCell>
                <TableCell>{course.semester}</TableCell>
                <TableCell>{course.curriculum.name}</TableCell> 
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