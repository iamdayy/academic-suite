// 📁 apps/web/app/admin/curriculums/page.tsx
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
interface StudyProgram {
  id: bigint;
  name: string;
  level: string;
}
interface Curriculum {
  id: bigint;
  name: string;
  year: number;
  studyProgram: {
    name: string; // Kita include nama prodi
  };
  createdAt: string;
}

export default function CurriculumsPage() {
  // 2. State untuk data tabel, dropdown, dan loading
  const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
  const [studyPrograms, setStudyPrograms] = useState<StudyProgram[]>([]); // Untuk dropdown
  const [isLoading, setIsLoading] = useState(true);

  // 3. State untuk dialog form
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 4. State untuk form input
  const [newName, setNewName] = useState("");
  const [newYear, setNewYear] = useState("");
  const [selectedProdiId, setSelectedProdiId] = useState("");

  // 5. Fungsi untuk mengambil SEMUA data
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [curriculumsRes, prodiRes] = await Promise.all([
        api.get('/curriculums'),
        api.get('/study-programs') // API ini sudah kita buat
      ]);
      setCurriculums(curriculumsRes.data);
      setStudyPrograms(prodiRes.data);
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
    if (!selectedProdiId || !newName || !newYear) {
      toast.error('Mohon isi semua field.');
      return;
    }
    if (isNaN(Number(newYear))) {
      toast.error('Tahun harus berupa angka.')
      return;
    }
    setIsSubmitting(true);

    try {
      await api.post('/curriculums', {
        name: newName,
        year: Number(newYear), // Konversi ke number
        studyProgramId: Number(selectedProdiId), // Konversi ke number
      });
      toast.success('Kurikulum berhasil ditambahkan.');

      setIsDialogOpen(false); // Tutup dialog
      // Reset form
      setNewName("");
      setNewYear("");
      setSelectedProdiId("");
      fetchData(); // Ambil ulang data

    } catch (error: any) {
      console.error("Gagal menambah kurikulum:", error);
      toast.error('Terjadi kesalahan saat menambah kurikulum.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manajemen Kurikulum</h1>

        {/* 8. Tombol & Dialog untuk Tambah Baru */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Tambah Kurikulum
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Tambah Kurikulum Baru</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {/* Input Nama Kurikulum */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Nama
                  </Label>
                  <Input
                    id="name"
                    placeholder="Kurikulum 2024"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="col-span-3"
                    required
                  />
                </div>
                {/* Input Tahun */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="year" className="text-right">
                    Tahun
                  </Label>
                  <Input
                    id="year"
                    type="number"
                    placeholder="2024"
                    value={newYear}
                    onChange={(e) => setNewYear(e.target.value)}
                    className="col-span-3"
                    required
                  />
                </div>
                {/* Select Program Studi */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="prodi" className="text-right">
                    Prodi
                  </Label>
                  <Select value={selectedProdiId} onValueChange={setSelectedProdiId}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Pilih Program Studi" />
                    </SelectTrigger>
                    <SelectContent>
                      {studyPrograms.map((prodi) => (
                        <SelectItem key={prodi.id.toString()} value={prodi.id.toString()}>
                          {prodi.name} ({prodi.level})
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
              <TableHead>Nama Kurikulum</TableHead>
              <TableHead>Tahun</TableHead>
              <TableHead>Program Studi</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {curriculums.map((cur) => (
              <TableRow key={cur.id.toString()}>
                <TableCell>{cur.id.toString()}</TableCell>
                <TableCell className="font-medium">{cur.name}</TableCell>
                <TableCell>{cur.year}</TableCell>
                <TableCell>{cur.studyProgram.name}</TableCell> 
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