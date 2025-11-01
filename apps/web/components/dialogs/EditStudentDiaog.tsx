// 📁 apps/web/components/EditStudentDialog.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
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
import api from "@/lib/api";
import { Edit, Loader2 } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

// Definisikan tipe data
interface StudyProgram {
  id: bigint;
  name: string;
  level: string;
}
interface Student {
  id: bigint;
  name: string;
  nim: string;
  studyProgram: {
    id: bigint;
  };
}

// Definisikan props
interface EditStudentDialogProps {
  student: Student; // Menerima data mahasiswa yang akan diedit
  studyPrograms: StudyProgram[]; // Menerima daftar prodi untuk dropdown
  onSuccess: () => void; // Callback untuk refresh tabel
}

export function EditStudentDialog({
  student,
  studyPrograms,
  onSuccess,
}: EditStudentDialogProps) {
  // 1. Isi form dengan data yang ada
  const [name, setName] = useState(student.name);
  const [nim, setNim] = useState(student.nim);
  const [selectedProdiId, setSelectedProdiId] = useState(
    student.studyProgram.id.toString()
  );

  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Sinkronkan state jika prop berubah
  useEffect(() => {
    setName(student.name);
    setNim(student.nim);
    setSelectedProdiId(student.studyProgram.id.toString());
  }, [student]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 2. Panggil API PATCH (Update)
      await api.patch(`/students/${student.id}`, {
        name: name,
        nim: nim,
        studyProgramId: Number(selectedProdiId),
      });

      toast.success("Berhasil mengupdate mahasiswa!");

      setIsOpen(false); // Tutup dialog
      onSuccess(); // Panggil callback untuk refresh data!
    } catch (error: any) {
      console.error("Gagal mengupdate mahasiswa:", error);
      toast.error("Gagal mengupdate mahasiswa");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Profil Mahasiswa: {student.name}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nim">NIM</Label>
              <Input
                id="nim"
                value={nim}
                onChange={(e) => setNim(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap Mahasiswa</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prodi">Program Studi</Label>
              <Select
                value={selectedProdiId}
                onValueChange={setSelectedProdiId}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Program Studi..." />
                </SelectTrigger>
                <SelectContent>
                  {studyPrograms.map((prodi) => (
                    <SelectItem
                      key={prodi.id.toString()}
                      value={prodi.id.toString()}
                    >
                      {prodi.name} ({prodi.level})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Kita tidak mengedit Akun User dari sini */}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Batal
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
