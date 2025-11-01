// 📁 apps/web/components/EditClassDialog.tsx
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
interface Course {
  id: bigint;
  name: string;
  code: string;
}
interface Lecturer {
  id: bigint;
  name: string;
}
interface Class {
  id: bigint;
  name: string;
  course: { id: bigint };
  lecturer: { id: bigint };
}

// Definisikan props
interface EditClassDialogProps {
  classToEdit: Class; // Data kelas yang akan diedit
  // Data untuk mengisi dropdown
  courses: Course[];
  lecturers: Lecturer[];
  onSuccess: () => void; // Callback untuk refresh
}

export function EditClassDialog({
  classToEdit,
  courses,
  lecturers,
  onSuccess,
}: EditClassDialogProps) {
  // 1. Isi form dengan data yang ada
  const [name, setName] = useState(classToEdit.name);
  const [selectedCourseId, setSelectedCourseId] = useState(
    classToEdit.course.id.toString()
  );
  const [selectedLecturerId, setSelectedLecturerId] = useState(
    classToEdit.lecturer.id.toString()
  );

  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Sinkronkan state jika prop berubah (penting jika data di-refresh)
  useEffect(() => {
    setName(classToEdit.name);
    setSelectedCourseId(classToEdit.course.id.toString());
    setSelectedLecturerId(classToEdit.lecturer.id.toString());
  }, [classToEdit]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 2. Panggil API PATCH (Update)
      // Kita tidak mengirim 'academicYearId' karena itu tidak boleh diubah
      await api.patch(`/classes/${classToEdit.id}`, {
        name: name,
        courseId: Number(selectedCourseId),
        lecturerId: Number(selectedLecturerId),
      });

      toast.success("Berhasil mengupdate kelas!");

      setIsOpen(false); // Tutup dialog
      onSuccess(); // Panggil callback untuk refresh data!
    } catch (error: any) {
      console.error("Gagal mengupdate kelas:", error);
      toast.error("Gagal mengupdate kelas");
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
            <DialogTitle>Edit Kelas: {classToEdit.name}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Form sama seperti form "Tambah Baru" */}
            {/* Select Mata Kuliah */}
            <div className="space-y-2">
              <Label htmlFor="course">Mata Kuliah</Label>
              <Select
                value={selectedCourseId}
                onValueChange={setSelectedCourseId}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Mata Kuliah" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem
                      key={course.id.toString()}
                      value={course.id.toString()}
                    >
                      {course.code} - {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Select Dosen */}
            <div className="space-y-2">
              <Label htmlFor="lecturer">Dosen Pengajar</Label>
              <Select
                value={selectedLecturerId}
                onValueChange={setSelectedLecturerId}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Dosen" />
                </SelectTrigger>
                <SelectContent>
                  {lecturers.map((lecturer) => (
                    <SelectItem
                      key={lecturer.id.toString()}
                      value={lecturer.id.toString()}
                    >
                      {lecturer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Input Nama Kelas */}
            <div className="space-y-2">
              <Label htmlFor="name">Nama Kelas</Label>
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
