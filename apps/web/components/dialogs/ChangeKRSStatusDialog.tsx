// 📁 apps/web/components/ChangeKrsStatusDialog.tsx
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
interface KrsHeader {
  id: bigint;
  status: string;
  student: { name: string };
}

// Definisikan props
interface ChangeKrsStatusDialogProps {
  krsHeader: KrsHeader; // Menerima data KRS yang akan diubah
  onSuccess: () => void; // Callback untuk refresh tabel
}

export function ChangeKrsStatusDialog({
  krsHeader,
  onSuccess,
}: ChangeKrsStatusDialogProps) {
  // 1. Isi form dengan status yang ada
  const [selectedStatus, setSelectedStatus] = useState(krsHeader.status);

  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setSelectedStatus(krsHeader.status);
  }, [krsHeader]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 2. Panggil API PATCH (Update)
      // DTO backend kita sudah diatur untuk hanya menerima 'status'
      await api.patch(`/krs-headers/${krsHeader.id}`, {
        status: selectedStatus,
      });

      toast.success("Berhasil mengupdate status!");

      setIsOpen(false); // Tutup dialog
      onSuccess(); // Panggil callback untuk refresh data!
    } catch (error: any) {
      console.error("Gagal mengupdate status:", error);
      toast.error("Gagal mengupdate status");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4 mr-2" /> Ubah Status
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Ubah Status KRS</DialogTitle>
            <DialogDescription>
              Mahasiswa: {krsHeader.student.name}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={selectedStatus}
                onValueChange={setSelectedStatus}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">DRAFT</SelectItem>
                  <SelectItem value="APPROVED">APPROVED (Disetujui)</SelectItem>
                  <SelectItem value="REJECTED">REJECTED (Ditolak)</SelectItem>
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
