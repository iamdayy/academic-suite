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
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/api";
import { upload } from "@vercel/blob/client";
import { Edit, Loader2, PlusCircle } from "lucide-react";
import { ChangeEvent, FormEvent, useState } from "react";
import { toast } from "sonner";

// 1. Definisikan tipe data Materi
interface Material {
  id: bigint;
  title: string;
  content?: string | null;
  fileUrl?: string | null;
}

// 2. Modifikasi props
interface MaterialFormDialogProps {
  classId: bigint;
  material?: Material; // <-- Buat opsional. Jika ada, ini mode Edit
  onSuccess: () => void;
}

export function MaterialFormDialog({
  classId,
  material,
  onSuccess,
}: MaterialFormDialogProps) {
  // 3. Tentukan mode berdasarkan props
  const isEditMode = !!material;

  // 4. Isi form dengan data yang ada (jika mode edit)
  const [title, setTitle] = useState(material?.title || "");
  const [content, setContent] = useState(material?.content || "");
  const [file, setFile] = useState<File | null>(null);
  const [existingFileUrl, setExistingFileUrl] = useState(
    material?.fileUrl || ""
  );

  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]!);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    let fileUrl = existingFileUrl;

    try {
      if (file) {
        const newBlob = await upload(file.name, file, {
          access: "public",
          handleUploadUrl: "/api/upload",
        });
        fileUrl = newBlob.url;
      }
      const payload = {
        title,
        content,
        fileUrl,
        classId: Number(classId),
      };

      if (isEditMode) {
        // 5. Panggil API PATCH jika mode Edit
        await api.patch(`/materials/${material.id}`, payload);
        toast.success("Berhasil mengupdate materi!");
      } else {
        // 6. Panggil API POST jika mode Tambah
        await api.post("/materials", payload);
        toast.success("Berhasil menambahkan materi!");
      }

      setIsOpen(false);
      onSuccess(); // Panggil callback untuk refresh data!
    } catch (error: any) {
      console.error("Gagal memproses materi:", error);
      toast.error("Gagal memproses materi.");
    } finally {
      setIsLoading(false);
    }
  };

  // 7. Reset form saat dialog ditutup (jika mode Tambah)
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setTitle(material?.title || "");
      setContent(material?.content || "");
      setFile(null);
      setExistingFileUrl(material?.fileUrl || "");
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
            <PlusCircle className="mr-2 h-4 w-4" /> Tambah Materi Baru
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditMode
                ? `Edit Materi: ${material.title}`
                : "Tambah Materi Baru"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Ubah detail materi di bawah ini."
                : "Isi detail materi untuk kelas ini."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Judul</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Deskripsi (Opsional)</Label>
              <Textarea
                id="content"
                value={content ?? ""}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fileUpload">Upload File (Opsional)</Label>
              <Input id="fileUpload" type="file" onChange={handleFileChange} />
              {/* Tampilkan file yang sedang dipilih atau yang sudah ada */}
              {file && (
                <p className="text-sm text-muted-foreground">
                  File baru: {file.name}
                </p>
              )}
              {!file && existingFileUrl && (
                <p className="text-sm text-muted-foreground">
                  File saat ini:{" "}
                  <a
                    href={existingFileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    Lihat
                  </a>
                </p>
              )}
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
