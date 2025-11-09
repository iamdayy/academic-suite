// 📁 apps/web/components/CreateKrsDialog.tsx
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
interface AcademicYear {
  id: bigint;
  year: string;
  semester: string;
}

// Definisikan props
interface CreateKrsDialogProps {
  onSuccess: () => void; // Callback untuk refresh tabel
}

export function CreateKrsDialog({ onSuccess }: CreateKrsDialogProps) {
  // State untuk dropdown
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);

  // State untuk form
  const [selectedYearId, setSelectedYearId] = useState("");
  const [semester, setSemester] = useState(""); // Semester ke- (misal: 3)

  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Ambil data Tahun Ajaran saat dialog dibuka
  useEffect(() => {
    if (isOpen && academicYears.length === 0) {
      api
        .get("/academic-years")
        .then((res) => setAcademicYears(res.data))
        .catch((err) => {
          console.error("Gagal fetch T.A.:", err);
          toast.error("Terjadi kesalahan saat mengambil data tahun ajaran.");
        });
    }
  }, [isOpen, academicYears.length, toast]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedYearId || !semester) {
      toast.error("Pilih tahun ajaran dan semester terlebih dahulu.");
      return;
    }
    setIsLoading(true);

    try {
      // Panggil API POST /krs-headers
      await api.post("/krs-headers", {
        academicYearId: Number(selectedYearId),
        semester: Number(semester),
      });

      toast.success("Berhasil membuat KRS!");

      setIsOpen(false); // Tutup dialog
      // Reset form
      setSelectedYearId("");
      setSemester("");

      onSuccess(); // Panggil callback refresh
    } catch (error: any) {
      console.error("Gagal membuat KRS:", error);
      toast.error("Terjadi kesalahan saat membuat KRS.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="mb-4">
          <PlusCircle className="mr-2 h-4 w-4" /> Isi KRS Baru
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Isi KRS Baru</DialogTitle>
            <DialogDescription>
              Pilih tahun ajaran dan semester ke berapa yang akan Anda ambil.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="academicYear">Tahun Ajaran</Label>
              <Select
                value={selectedYearId}
                onValueChange={setSelectedYearId}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Tahun Ajaran..." />
                </SelectTrigger>
                <SelectContent>
                  {academicYears.map((year) => (
                    <SelectItem
                      key={year.id.toString()}
                      value={year.id.toString()}
                    >
                      {year.year} - {year.semester}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="semester">Semester Ke-</Label>
              <Input
                id="semester"
                type="number"
                min="1"
                max="14"
                placeholder="Contoh: 3"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
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
              Buat Lembar KRS
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
