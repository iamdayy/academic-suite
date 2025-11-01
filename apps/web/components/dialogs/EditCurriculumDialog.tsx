// 📁 apps/web/components/EditCurriculumDialog.tsx
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

// Definisikan tipe data Kurikulum
interface Curriculum {
  id: bigint;
  name: string;
  year: number;
}

// Definisikan props
interface EditCurriculumDialogProps {
  curriculum: Curriculum; // Menerima data kurikulum yang akan diedit
  onSuccess: () => void; // Callback untuk refresh tabel
}

export function EditCurriculumDialog({
  curriculum,
  onSuccess,
}: EditCurriculumDialogProps) {
  // 1. Isi form dengan data yang ada
  const [name, setName] = useState(curriculum.name);
  const [year, setYear] = useState(curriculum.year.toString()); // Input number harus jadi string

  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Sinkronkan state jika prop berubah
  useEffect(() => {
    setName(curriculum.name);
    setYear(curriculum.year.toString());
  }, [curriculum]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 2. Panggil API PATCH (Update)
      await api.patch(`/curriculums/${curriculum.id}`, {
        name: name,
        year: Number(year), // Konversi kembali ke number
      });

      toast.success("Berhasil mengupdate kurikulum!");

      setIsOpen(false); // Tutup dialog
      onSuccess(); // Panggil callback untuk refresh data!
    } catch (error: any) {
      console.error("Gagal mengupdate kurikulum:", error);
      toast.error("Terjadi kesalahan saat mengupdate kurikulum.");
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
            <DialogTitle>Edit Kurikulum: {curriculum.name}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Kurikulum</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Tahun</Label>
              <Input
                id="year"
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="Contoh: 2024"
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
