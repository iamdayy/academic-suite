// 📁 apps/web/components/EditLecturerDialog.tsx
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

// Definisikan tipe data
interface Lecturer {
  id: bigint;
  name: string;
  nidn: string;
}

// Definisikan props
interface EditLecturerDialogProps {
  lecturer: Lecturer; // Menerima data dosen yang akan diedit
  onSuccess: () => void; // Callback untuk refresh tabel
}

export function EditLecturerDialog({
  lecturer,
  onSuccess,
}: EditLecturerDialogProps) {
  // 1. Isi form dengan data yang ada
  const [name, setName] = useState(lecturer.name);
  const [nidn, setNidn] = useState(lecturer.nidn);

  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Sinkronkan state jika prop berubah
  useEffect(() => {
    setName(lecturer.name);
    setNidn(lecturer.nidn);
  }, [lecturer]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 2. Panggil API PATCH (Update)
      await api.patch(`/lecturers/${lecturer.id}`, {
        name: name,
        nidn: nidn,
      });

      toast.success("Berhasil mengupdate dosen!");

      setIsOpen(false); // Tutup dialog
      onSuccess(); // Panggil callback untuk refresh data!
    } catch (error: any) {
      console.error("Gagal mengupdate dosen:", error);
      toast.error("Gagal mengupdate dosen");
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
            <DialogTitle>Edit Profil Dosen: {lecturer.name}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap Dosen</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nidn">NIDN</Label>
              <Input
                id="nidn"
                value={nidn}
                onChange={(e) => setNidn(e.target.value)}
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
