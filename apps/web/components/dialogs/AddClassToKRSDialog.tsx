// 📁 apps/web/components/AddClassToKrsDialog.tsx
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
import { Loader2, PlusCircle } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

// Tipe data untuk dropdown
interface AvailableClass {
  id: bigint;
  name: string; // "Kelas A"
  course: { code: string; name: string }; // "IF101 - Dasar Pemrograman"
}

// Definisikan props
interface AddClassToKrsDialogProps {
  krsHeaderId: bigint;
  academicYearId: bigint; // Kita butuh ini untuk memfilter kelas
  existingClassIds: bigint[]; // Untuk memfilter yang sudah diambil
  onSuccess: () => void;
}

export function AddClassToKrsDialog({
  krsHeaderId,
  academicYearId,
  existingClassIds,
  onSuccess,
}: AddClassToKrsDialogProps) {
  const [availableClasses, setAvailableClasses] = useState<AvailableClass[]>(
    []
  );
  const [selectedClassId, setSelectedClassId] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingClasses, setIsFetchingClasses] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Ambil daftar kelas yang dibuka semester ini
  useEffect(() => {
    if (isOpen) {
      setIsFetchingClasses(true);
      // Panggil API GET /classes, difilter berdasarkan T.A.
      api
        .get(`/classes?academicYearId=${academicYearId}`)
        .then((res) => setAvailableClasses(res.data))
        .catch((err) => {
          console.error("Gagal fetch kelas:", err);
          toast.error("Terjadi kesalahan saat mengambil data kelas.");
        })
        .finally(() => setIsFetchingClasses(false));
    }
  }, [isOpen, academicYearId, toast]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedClassId) {
      toast.error("Pilih kelas terlebih dahulu.");
      return;
    }
    setIsLoading(true);

    try {
      // Panggil API POST /krs-details dengan classId
      await api.post("/krs-details", {
        krsHeaderId: Number(krsHeaderId),
        classId: Number(selectedClassId), // Kirim classId
      });

      toast.success("Berhasil menambah kelas!");

      setIsOpen(false);
      setSelectedClassId("");
      onSuccess(); // Refresh tabel
    } catch (error: any) {
      console.error("Gagal menambah kelas:", error);
      toast.error("Terjadi kesalahan saat menambah kelas.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="mb-4">
          <PlusCircle className="mr-2 h-4 w-4" /> Tambah Kelas
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Tambah Kelas</DialogTitle>
            <DialogDescription>
              Pilih kelas yang akan diambil semester ini.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="class">Kelas yang Tersedia</Label>
              <Select
                value={selectedClassId}
                onValueChange={setSelectedClassId}
                required
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      isFetchingClasses ? "Memuat..." : "Pilih Kelas..."
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {availableClasses
                    .filter((cls) => !existingClassIds.includes(cls.id)) // Filter yang sudah ada
                    .map((cls) => (
                      <SelectItem
                        key={cls.id.toString()}
                        value={cls.id.toString()}
                      >
                        {cls.course.code} - {cls.course.name} ({cls.name})
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
            <Button type="submit" disabled={isLoading || isFetchingClasses}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Tambahkan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
