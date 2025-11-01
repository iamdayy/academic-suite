// 📁 apps/web/components/EditCourseDialog.tsx
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

// Definisikan tipe data Mata Kuliah
interface Course {
  id: bigint;
  code: string;
  name: string;
  credits: number;
  semester: number;
}

// Definisikan props
interface EditCourseDialogProps {
  course: Course; // Menerima data matkul yang akan diedit
  onSuccess: () => void; // Callback untuk refresh tabel
}

export function EditCourseDialog({ course, onSuccess }: EditCourseDialogProps) {
  // 1. Isi form dengan data yang ada
  const [code, setCode] = useState(course.code);
  const [name, setName] = useState(course.name);
  const [credits, setCredits] = useState(course.credits.toString());
  const [semester, setSemester] = useState(course.semester.toString());

  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Sinkronkan state jika prop berubah
  useEffect(() => {
    setCode(course.code);
    setName(course.name);
    setCredits(course.credits.toString());
    setSemester(course.semester.toString());
  }, [course]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 2. Panggil API PATCH (Update)
      await api.patch(`/courses/${course.id}`, {
        code: code,
        name: name,
        credits: Number(credits),
        semester: Number(semester),
      });

      toast.success("Berhasil mengupdate matkul!");

      setIsOpen(false); // Tutup dialog
      onSuccess(); // Panggil callback untuk refresh data!
    } catch (error: any) {
      console.error("Gagal mengupdate matkul:", error);
      toast.error("Gagal mengupdate matkul");
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
            <DialogTitle>Edit Mata Kuliah: {course.name}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Form sama seperti form "Tambah Baru" */}
            <div className="space-y-2">
              <Label htmlFor="code">Kode MK</Label>
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nama Mata Kuliah</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="credits">SKS</Label>
                <Input
                  id="credits"
                  type="number"
                  value={credits}
                  onChange={(e) => setCredits(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="semester">Semester</Label>
                <Input
                  id="semester"
                  type="number"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  required
                />
              </div>
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
