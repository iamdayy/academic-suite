// 📁 apps/web/components/GradeSubmissionDialog.tsx
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
import { FormEvent, useState } from "react";
import { toast } from "sonner";

interface GradeSubmissionDialogProps {
  submissionId: bigint;
  studentName: string;
  currentGrade: number | null;
  onSuccess: () => void; // Callback untuk refresh
}

export function GradeSubmissionDialog({
  submissionId,
  studentName,
  currentGrade,
  onSuccess,
}: GradeSubmissionDialogProps) {
  const [grade, setGrade] = useState(currentGrade?.toString() || "");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await api.patch(`/assignment-submissions/${submissionId}/grade`, {
        grade: Number(grade), // Kirim sebagai angka
      });
      
      toast.success("Nilai berhasil diberikan!");
      
      setIsOpen(false);
      onSuccess(); // Panggil callback refresh

    } catch (error: any) {
      console.error("Gagal memberi nilai:", error);
      toast.error("Gagal memberi nilai.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          {currentGrade !== null ? "Edit Nilai" : "Beri Nilai"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xs">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Beri Nilai: {studentName}</DialogTitle>
            <DialogDescription>
              Masukkan nilai antara 0 - 100.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="grade">Nilai</Label>
              <Input
                id="grade"
                type="number"
                min="0"
                max="100"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
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
              Simpan Nilai
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}