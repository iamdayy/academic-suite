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
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner"; // Impor hook toast

// Terima ID tugas sebagai prop
interface SubmissionDialogProps {
  assignmentId: bigint;
  assignmentTitle: string;
  onSuccess: () => void;
}

export function SubmissionDialog({ assignmentId, assignmentTitle, onSuccess }: SubmissionDialogProps) {
  const [fileUrl, setFileUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Panggil API pengumpulan tugas
      await api.post('/assignment-submissions', {
        fileUrl: fileUrl,
        assignmentId: Number(assignmentId),
      });

      toast('Tugas berhasil dikumpulkan!');

      setIsOpen(false); // Tutup dialog jika berhasil
      setFileUrl(""); // Kosongkan form
      onSuccess(); // Panggil callback untuk refresh data!

    } catch (error: any) {
      console.error("Gagal mengumpulkan:", error);
      toast('Gagal mengumpulkan tugas.')
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
                type="url"
                placeholder="https://..."
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
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