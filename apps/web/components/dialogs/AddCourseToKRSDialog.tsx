// 📁 apps/web/components/AddCourseToKrsDialog.tsx
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
interface AvailableCourse {
  id: bigint;
  code: string;
  name: string;
  semester: number;
}

// Definisikan props
interface AddCourseToKrsDialogProps {
  krsHeaderId: bigint;
  onSuccess: () => void; // Callback untuk refresh tabel
  existingCourseIds: bigint[];
}

export function AddCourseToKrsDialog({
  krsHeaderId,
  onSuccess,
  existingCourseIds,
}: AddCourseToKrsDialogProps) {
  const [availableCourses, setAvailableCourses] = useState<AvailableCourse[]>(
    []
  );
  const [selectedCourseId, setSelectedCourseId] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingCourses, setIsFetchingCourses] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Ambil daftar mata kuliah saat dialog dibuka
  useEffect(() => {
    if (isOpen) {
      setIsFetchingCourses(true);
      api
        .get("/courses/available")
        .then((res) => setAvailableCourses(res.data))
        .catch((err) => {
          console.error("Gagal fetch mata kuliah:", err);
          toast.error("Terjadi kesalahan saat mengambil data mata kuliah.");
        })
        .finally(() => setIsFetchingCourses(false));
    }
  }, [isOpen, toast]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId) {
      toast.error("Pilih mata kuliah terlebih dahulu.");
      return;
    }
    setIsLoading(true);

    try {
      // Panggil API POST /krs-details
      await api.post("/krs-details", {
        krsHeaderId: Number(krsHeaderId),
        courseId: Number(selectedCourseId),
      });

      toast.success("Berhasil menambah mata kuliah!");

      setIsOpen(false); // Tutup dialog
      setSelectedCourseId(""); // Reset form
      onSuccess(); // Panggil callback refresh
    } catch (error: any) {
      console.error("Gagal menambah mata kuliah:", error);
      toast.error("Terjadi kesalahan saat menambah mata kuliah.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="mb-4">
          <PlusCircle className="mr-2 h-4 w-4" /> Tambah Mata Kuliah
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Tambah Mata Kuliah</DialogTitle>
            <DialogDescription>
              Pilih mata kuliah dari kurikulum Anda.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="course">Mata Kuliah</Label>
              <Select
                value={selectedCourseId}
                onValueChange={setSelectedCourseId}
                required
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      isFetchingCourses ? "Memuat..." : "Pilih Mata Kuliah..."
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {availableCourses
                    .filter((course) => !existingCourseIds.includes(course.id))
                    .map((course) => (
                      <SelectItem
                        key={course.id.toString()}
                        value={course.id.toString()}
                      >
                        (Sem {course.semester}) {course.code} - {course.name}
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
            <Button type="submit" disabled={isLoading || isFetchingCourses}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Tambahkan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
