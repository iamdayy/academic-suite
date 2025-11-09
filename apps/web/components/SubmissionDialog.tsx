// 📁 apps/web/components/SubmissionDialog.tsx
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
import api from "@/lib/api";
import { upload } from "@vercel/blob/client";
import { Loader2 } from "lucide-react";
import { ChangeEvent, FormEvent, useState } from "react";
import { toast } from "sonner"; // Impor hook toast

// Terima ID tugas sebagai prop
interface SubmissionDialogProps {
  assignmentId: bigint;
  assignmentTitle: string;
  onSuccess: () => void;
}

export function SubmissionDialog({
  assignmentId,
  assignmentTitle,
  onSuccess,
}: SubmissionDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]!);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Pilih file terlebih dahulu.");
      return;
    }
    setIsLoading(true);

    try {
      // 2. ALUR UPLOAD BARU (Vercel Blob)

      // A: Upload file langsung dari client ke Vercel Blob
      // Ini akan memanggil '/api/upload' (Next.js route) kita di belakang layar
      const newBlob = await upload(file.name, file, {
        access: "public", // File bisa diakses publik
        handleUploadUrl: "/api/upload", // Endpoint Next.js kita
      });

      // B: Simpan URL permanennya ke database kita via API NestJS
      await api.post("/assignment-submissions", {
        fileUrl: newBlob.url, // URL dari Vercel Blob
        assignmentId: Number(assignmentId),
      });

      toast.success("Berhasil mengumpulkan tugas!");

      setIsOpen(false);
      setFile(null);
      onSuccess();
    } catch (error: any) {
      console.error("Gagal mengumpulkan:", error);
      toast.error("Gagal mengumpulkan tugas.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm">
          Kumpulkan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Kumpulkan: {assignmentTitle}</DialogTitle>
            <DialogDescription>
              Masukkan URL file tugas Anda (Google Drive, GitHub, dll.).
              Pastikan link dapat diakses.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fileUrl" className="text-right">
                File URL
              </Label>
              <Input
                id="fileUrl"
                type="file"
                placeholder="https://..."
                onChange={handleFileChange}
                className="col-span-3"
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
              Submit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
