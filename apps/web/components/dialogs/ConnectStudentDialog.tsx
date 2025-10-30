// 📁 apps/web/components/ConnectStudentDialog.tsx
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
import { Loader2 } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

interface Student {
  id: bigint;
  name: string;
  nim: string;
}

interface ConnectStudentDialogProps {
  guardianId: bigint;
  guardianName: string;
  onSuccess: () => void; // Callback untuk refresh
}

export function ConnectStudentDialog({
  guardianId,
  guardianName,
  onSuccess,
}: ConnectStudentDialogProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Ambil daftar mahasiswa saat dialog pertama kali dibuka
  useEffect(() => {
    if (isOpen && students.length === 0) {
      api.get('/students')
        .then(res => setStudents(res.data))
        .catch(err => console.error("Gagal fetch students:", err));
    }
  }, [isOpen, students.length]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) {
        toast.error("Pilih mahasiswa terlebih dahulu.");
       return;
    }
    setIsLoading(true);

    try {
      await api.post(`/guardians/${guardianId}/connect-student`, {
        studentId: Number(selectedStudentId), // Kirim sebagai angka
      });

      toast.success("Berhasil menghubungkan!");

      setIsOpen(false);
      setSelectedStudentId("");
      onSuccess(); // Panggil callback refresh

    } catch (error: any) {
      console.error("Gagal menghubungkan:", error);
      toast.error("Terjadi kesalahan saat menghubungkan.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Hubungkan ke Mhs
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xs">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Hubungkan ke: {guardianName}</DialogTitle>
            <DialogDescription>
              Pilih mahasiswa yang akan diwalikan.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="student">Pilih Mahasiswa</Label>
              <Select value={selectedStudentId} onValueChange={setSelectedStudentId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Cari Mahasiswa..." />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id.toString()} value={student.id.toString()}>
                      {student.name} ({student.nim})
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
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Hubungkan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}