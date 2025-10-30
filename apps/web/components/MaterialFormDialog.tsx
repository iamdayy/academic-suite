// 📁 apps/web/components/MaterialFormDialog.tsx
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
import { Textarea } from "@/components/ui/textarea"; // <-- Kita butuh Textarea
import api from "@/lib/api";
import { Loader2, PlusCircle } from "lucide-react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

// Definisikan props
interface MaterialFormDialogProps {
  classId: bigint;
  // 'onSuccess' adalah fungsi callback untuk me-refresh tabel di halaman induk
  onSuccess: () => void; 
}

export function MaterialFormDialog({ classId, onSuccess }: MaterialFormDialogProps) {
  // State untuk form
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [fileUrl, setFileUrl] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Panggil API POST /materials
      await api.post('/materials', {
        title,
        content,
        fileUrl,
        classId: Number(classId), // Konversi bigint ke number
      });

      toast.success("Materi berhasil ditambahkan!");

      setIsOpen(false); // Tutup dialog
      // Reset form
      setTitle("");
      setContent("");
      setFileUrl("");

      onSuccess(); // Panggil callback untuk refresh data!

    } catch (error: any) {
      console.error("Gagal menambah materi:", error);
      toast.error("Gagal menambah materi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="mb-4">
            <PlusCircle className="mr-2 h-4 w-4" /> Tambah Materi Baru
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Tambah Materi Baru</DialogTitle>
            <DialogDescription>
              Isi detail materi untuk kelas ini.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Input Judul */}
            <div className="space-y-2">
              <Label htmlFor="title">Judul</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            {/* Input Konten/Deskripsi */}
            <div className="space-y-2">
              <Label htmlFor="content">Deskripsi (Opsional)</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Tulis deskripsi singkat materi di sini..."
              />
            </div>
            {/* Input URL File */}
            <div className="space-y-2">
              <Label htmlFor="fileUrl">URL File (Opsional)</Label>
              <Input
                id="fileUrl"
                type="url"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                placeholder="https://google-drive.com/file..."
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