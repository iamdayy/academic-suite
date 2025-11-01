// 📁 apps/web/components/EditMajorDialog.tsx
"use client";

import { Button } from "@/components/ui/button";
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
import api from "@/lib/api";
import { Edit, Loader2 } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

// Definisikan tipe data Major
interface Major {
  id: bigint;
  name: string;
}

// Definisikan props
interface EditMajorDialogProps {
  major: Major; // Menerima data jurusan yang akan diedit
  onSuccess: () => void; // Callback untuk refresh tabel
}

export function EditMajorDialog({ major, onSuccess }: EditMajorDialogProps) {
  // 1. Isi form dengan data yang ada
  const [name, setName] = useState(major.name);

  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Sinkronkan state jika prop berubah
  useEffect(() => {
    setName(major.name);
  }, [major]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 2. Panggil API PATCH (Update)
      await api.patch(`/majors/${major.id}`, {
        name: name,
      });

      toast.success("Berhasil mengupdate jurusan!");

      setIsOpen(false); // Tutup dialog
      onSuccess(); // Panggil callback untuk refresh data!
    } catch (error: any) {
      console.error("Gagal mengupdate jurusan:", error);
      toast.error("Terjadi kesalahan saat mengupdate jurusan.");
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
            <DialogTitle>Edit Jurusan: {major.name}</DialogTitle>
            <DialogDescription>Ubah nama untuk jurusan ini.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Jurusan</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
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
