// 📁 apps/web/components/AssignmentFormDialog.tsx
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
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/api";
import { Loader2, PlusCircle } from "lucide-react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

interface AssignmentFormDialogProps {
  classId: bigint;
  onSuccess: () => void; // Callback untuk me-refresh tabel
}

export function AssignmentFormDialog({ classId, onSuccess }: AssignmentFormDialogProps) {
  // State untuk form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState(""); // Kita pakai string YYYY-MM-DDTHH:MM

  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Panggil API POST /assignments
      await api.post('/assignments', {
        title,
        description,
        deadline: new Date(deadline).toISOString(), // Konversi ke ISO Date
        classId: Number(classId),
      });

      toast.success("Tugas berhasil ditambahkan!");

      setIsOpen(false); // Tutup dialog
      // Reset form
      setTitle("");
      setDescription("");
      setDeadline("");

      onSuccess(); // Panggil callback untuk refresh data!

    } catch (error: any) {
      console.error("Gagal menambah tugas:", error);
      toast.error("Gagal menambah tugas.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="mb-4">
            <PlusCircle className="mr-2 h-4 w-4" /> Tambah Tugas Baru
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Tambah Tugas Baru</DialogTitle>
            <DialogDescription>
              Isi detail tugas untuk kelas ini.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Input Judul */}
            <div className="space-y-2">
              <Label htmlFor="title">Judul Tugas</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            {/* Input Deskripsi */}
            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Jelaskan detail tugas di sini..."
                required
              />
            </div>
            {/* Input Deadline */}
            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline</Label>
              <Input
                id="deadline"
                type="datetime-local" // Input tanggal & waktu
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
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
              Simpan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}