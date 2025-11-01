// 📁 apps/web/components/AssignmentFormDialog.tsx
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
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/api";
import { Edit, Loader2, PlusCircle } from "lucide-react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

// 1. Definisikan tipe data Tugas
interface Assignment {
  id: bigint;
  title: string;
  description: string;
  deadline: string; // ISO string
}

// 2. Modifikasi props
interface AssignmentFormDialogProps {
  classId: bigint;
  assignment?: Assignment; // <-- Buat opsional. Jika ada, ini mode Edit
  onSuccess: () => void;
}

// Helper untuk format YYYY-MM-DDTHH:MM
const formatDateTimeForInput = (isoString: string | undefined) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  // Geser ke timezone lokal dan format
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
};

export function AssignmentFormDialog({
  classId,
  assignment,
  onSuccess,
}: AssignmentFormDialogProps) {
  // 3. Tentukan mode berdasarkan props
  const isEditMode = !!assignment;

  // 4. Isi form dengan data yang ada (jika mode edit)
  const [title, setTitle] = useState(assignment?.title || "");
  const [description, setDescription] = useState(assignment?.description || "");
  const [deadline, setDeadline] = useState(
    formatDateTimeForInput(assignment?.deadline) || ""
  );

  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = {
      title,
      description,
      deadline: new Date(deadline).toISOString(), // Konversi ke ISO Date
      classId: Number(classId),
    };

    try {
      if (isEditMode) {
        // 5. Panggil API PATCH jika mode Edit
        await api.patch(`/assignments/${assignment.id}`, payload);
        toast.success("Berhasil mengupdate tugas!");
      } else {
        // 6. Panggil API POST jika mode Tambah
        await api.post("/assignments", payload);
        toast.success("Berhasil menambahkan tugas!");
      }

      setIsOpen(false);
      onSuccess(); // Panggil callback untuk refresh data!
    } catch (error: any) {
      console.error("Gagal memproses tugas:", error);
      toast.error("Gagal memproses tugas.");
    } finally {
      setIsLoading(false);
    }
  };

  // 7. Reset form saat dialog ditutup (jika mode Tambah)
  const handleOpenChange = (open: boolean) => {
    if (!open && !isEditMode) {
      setTitle("");
      setDescription("");
      setDeadline("");
    }
    setIsOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {/* 8. Tampilkan tombol yang berbeda untuk Edit vs Tambah */}
        {isEditMode ? (
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
        ) : (
          <Button className="mb-4">
            <PlusCircle className="mr-2 h-4 w-4" /> Tambah Tugas Baru
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditMode
                ? `Edit Tugas: ${assignment.title}`
                : "Tambah Tugas Baru"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* ... (Form Input tidak berubah) ... */}
            <div className="space-y-2">
              <Label htmlFor="title">Judul Tugas</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline</Label>
              <Input
                id="deadline"
                type="datetime-local"
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
