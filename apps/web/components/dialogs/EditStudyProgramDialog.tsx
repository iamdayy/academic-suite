// 📁 apps/web/components/EditStudyProgramDialog.tsx
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
import api from "@/lib/api";
import { Edit, Loader2 } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

// Definisikan tipe data Prodi
interface StudyProgram {
  id: bigint;
  name: string;
  level: string;
}

// Definisikan props
interface EditStudyProgramDialogProps {
  studyProgram: StudyProgram; // Menerima data prodi yang akan diedit
  onSuccess: () => void; // Callback untuk refresh tabel
}

export function EditStudyProgramDialog({
  studyProgram,
  onSuccess,
}: EditStudyProgramDialogProps) {
  // 1. Isi form dengan data yang ada
  const [name, setName] = useState(studyProgram.name);
  const [level, setLevel] = useState(studyProgram.level);

  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Sinkronkan state jika prop berubah
  useEffect(() => {
    setName(studyProgram.name);
    setLevel(studyProgram.level);
  }, [studyProgram]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 2. Panggil API PATCH (Update)
      await api.patch(`/study-programs/${studyProgram.id}`, {
        name: name,
        level: level,
      });

      toast.success("Berhasil mengupdate prodi!");

      setIsOpen(false); // Tutup dialog
      onSuccess(); // Panggil callback untuk refresh data!
    } catch (error: any) {
      console.error("Gagal mengupdate prodi:", error);
      toast.error("Terjadi kesalahan saat mengupdate prodi.");
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
            <DialogTitle>Edit Prodi: {studyProgram.name}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Prodi</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="level">Jenjang</Label>
              <Input
                id="level"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                placeholder="Contoh: S1"
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
