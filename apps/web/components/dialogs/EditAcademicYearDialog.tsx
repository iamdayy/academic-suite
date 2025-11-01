// 📁 apps/web/components/EditAcademicYearDialog.tsx
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
interface AcademicYear {
  id: bigint;
  year: string;
  semester: string;
  startDate: string; // ISO string
  endDate: string; // ISO string
}

// Helper untuk format YYYY-MM-DD
const formatDateForInput = (isoString: string) => {
  if (!isoString) return "";
  return isoString.split("T")[0]; // Ambil YYYY-MM-DD
};

// Definisikan props
interface EditAcademicYearDialogProps {
  academicYear: AcademicYear; // Menerima data yang akan diedit
  onSuccess: () => void; // Callback untuk refresh tabel
}

export function EditAcademicYearDialog({
  academicYear,
  onSuccess,
}: EditAcademicYearDialogProps) {
  // 1. Isi form dengan data yang ada
  const [year, setYear] = useState(academicYear.year);
  const [semester, setSemester] = useState(academicYear.semester);
  const [startDate, setStartDate] = useState(
    formatDateForInput(academicYear.startDate)
  );
  const [endDate, setEndDate] = useState(
    formatDateForInput(academicYear.endDate)
  );

  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Sinkronkan state jika prop berubah
  useEffect(() => {
    setYear(academicYear.year);
    setSemester(academicYear.semester);
    setStartDate(formatDateForInput(academicYear.startDate));
    setEndDate(formatDateForInput(academicYear.endDate));
  }, [academicYear]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    if (!year || !semester || !startDate || !endDate) {
      toast.error("Semua field harus diisi.");
      return;
    }

    try {
      // 2. Panggil API PATCH (Update)
      await api.patch(`/academic-years/${academicYear.id}`, {
        year,
        semester,
        startDate: new Date(startDate), // DTO kita menerima Tipe Date
        endDate: new Date(endDate),
      });

      toast.success("Berhasil mengupdate tahun ajaran!");

      setIsOpen(false); // Tutup dialog
      onSuccess(); // Panggil callback untuk refresh data!
    } catch (error: any) {
      console.error("Gagal mengupdate:", error);
      toast.error("Gagal mengupdate tahun ajaran.");
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
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Tahun Ajaran: {academicYear.year}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Form sama seperti form "Tambah Baru" */}
            <div className="space-y-2">
              <Label htmlFor="year">Tahun (Cth: 2024/2025)</Label>
              <Input
                id="year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="semester">Semester (Cth: GANJIL)</Label>
              <Input
                id="semester"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">Tanggal Mulai</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Tanggal Selesai</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
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
