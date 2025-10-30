// 📁 apps/web/app/admin/study-programs/page.tsx
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
interface Major {
  id: bigint;
  name: string;
}
interface StudyProgram {
  id: bigint;
  name: string;
  level: string;
  major: {
    name: string; // Kita include nama major
  };
  createdAt: string;
}

export default function StudyProgramsPage() {
  // 2. State untuk data tabel, dropdown, dan loading
  const [studyPrograms, setStudyPrograms] = useState<StudyProgram[]>([]);
  const [majors, setMajors] = useState<Major[]>([]); // Untuk dropdown
  const [isLoading, setIsLoading] = useState(true);

  // 3. State untuk dialog form
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 4. State untuk form input
  const [newName, setNewName] = useState("");
  const [newLevel, setNewLevel] = useState("");
  const [selectedMajorId, setSelectedMajorId] = useState("");

  // 5. Fungsi untuk mengambil SEMUA data
  const fetchData = async () => {
    try {
      setIsLoading(true);
      // Kita panggil 2 API sekaligus
      const [prodiRes, majorsRes] = await Promise.all([
        api.get('/study-programs'),
        api.get('/majors')
      ]);
      setStudyPrograms(prodiRes.data);
      setMajors(majorsRes.data);
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
    if (!selectedMajorId) {
      toast.error('Mohon pilih jurusan terlebih dahulu.');
      return;
    }
    setIsSubmitting(true);

    try {
      await api.post('/study-programs', {
        name: newName,
        level: newLevel,
        majorId: Number(selectedMajorId), // Konversi ke number
      });
      toast.success('Prodi berhasil ditambahkan.');

      setIsDialogOpen(false); // Tutup dialog
      // Reset form
      setNewName("");
      setNewLevel("");
      setSelectedMajorId("");
      fetchData(); // Ambil ulang data

    } catch (error: any) {
      console.error("Gagal menambah prodi:", error);
      toast.error('Terjadi kesalahan saat menambah prodi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manajemen Program Studi</h1>

        {/* 8. Tombol & Dialog untuk Tambah Baru */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Tambah Prodi
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Tambah Prodi Baru</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {/* Input Nama Prodi */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Nama Prodi
                  </Label>
                  <Input
                    id="name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="col-span-3"
                    required
                  />
                </div>
                {/* Input Jenjang */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="level" className="text-right">
                    Jenjang
                  </Label>
                  <Input
                    id="level"
                    placeholder="Contoh: S1"
                    value={newLevel}
                    onChange={(e) => setNewLevel(e.target.value)}
                    className="col-span-3"
                    required
                  />
                </div>
                {/* Select Jurusan */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="major" className="text-right">
                    Jurusan
                  </Label>
                  <Select value={selectedMajorId} onValueChange={setSelectedMajorId}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Pilih Jurusan Induk" />
                    </SelectTrigger>
                    <SelectContent>
                      {majors.map((major) => (
                        <SelectItem key={major.id.toString()} value={major.id.toString()}>
                          {major.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
              <TableHead>Nama Prodi</TableHead>
              <TableHead>Jenjang</TableHead>
              <TableHead>Jurusan</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {studyPrograms.map((prodi) => (
              <TableRow key={prodi.id.toString()}>
                <TableCell>{prodi.id.toString()}</TableCell>
                <TableCell className="font-medium">{prodi.name}</TableCell>
                <TableCell>{prodi.level}</TableCell>
                <TableCell>{prodi.major.name}</TableCell> 
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