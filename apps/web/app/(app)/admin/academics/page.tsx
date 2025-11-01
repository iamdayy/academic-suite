// 📁 apps/web/app/admin/majors/page.tsx
"use client";

import { EditMajorDialog } from "@/components/dialogs/EditMajorDialog";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import api from "@/lib/api";
import { Loader2, PlusCircle, Trash2 } from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

// 1. Definisikan tipe data Major
interface Major {
  id: bigint;
  name: string;
  createdAt: string;
}

export default function MajorsPage() {
  // 2. State untuk data tabel dan loading
  const [majors, setMajors] = useState<Major[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 3. State untuk dialog form
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newMajorName, setNewMajorName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 4. Fungsi untuk mengambil data
  const fetchMajors = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/majors");
      setMajors(response.data);
    } catch (error) {
      console.error("Gagal mengambil data jurusan:", error);
      toast.error("Gagal mengambil data jurusan.");
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Ambil data saat komponen dimuat
  useEffect(() => {
    fetchMajors();
  }, []);

  // 6. Fungsi untuk submit form
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await api.post("/majors", { name: newMajorName });
      toast.success("Jurusan berhasil ditambahkan!");

      setIsDialogOpen(false); // Tutup dialog
      setNewMajorName(""); // Reset form
      fetchMajors(); // Ambil ulang data agar tabel ter-update
    } catch (error: any) {
      console.error("Gagal menambah jurusan:", error);
      toast.error("Gagal menambah jurusan.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleDelete = async (majorId: bigint, majorName: string) => {
    if (
      !confirm(
        `Apakah Anda yakin ingin menghapus jurusan "${majorName}"? Ini tidak bisa diurungkan.`
      )
    ) {
      return;
    }

    try {
      await api.delete(`/majors/${majorId}`);
      toast.success("Berhasil menghapus jurusan!");
      fetchMajors(); // Refresh tabel
    } catch (error: any) {
      console.error("Gagal menghapus jurusan:", error);
      toast.error("Terjadi kesalahan saat menghapus jurusan.");
    }
  };

  // 7. Format tanggal (Helper)
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manajemen Akademik (Jurusan)</h1>

        {/* 8. Tombol & Dialog untuk Tambah Baru */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Tambah Jurusan
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Tambah Jurusan Baru</DialogTitle>
                <DialogDescription>
                  Masukkan nama untuk jurusan baru di sini.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Nama
                  </Label>
                  <Input
                    id="name"
                    value={newMajorName}
                    onChange={(e) => setNewMajorName(e.target.value)}
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
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Simpan
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* 9. Tampilkan Tabel Data atau Loading */}
      {isLoading ? (
        <div className="flex justify-center mt-10">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Nama Jurusan</TableHead>
              <TableHead>Dibuat Pada</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {majors.map((major) => (
              <TableRow key={major.id.toString()}>
                <TableCell>{major.id.toString()}</TableCell>
                <TableCell className="font-medium">{major.name}</TableCell>
                <TableCell>{formatDate(major.createdAt)}</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/academics/${major.id}`}>
                      Kelola Prodi
                    </Link>
                  </Button>

                  <EditMajorDialog major={major} onSuccess={fetchMajors} />

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(major.id, major.name)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
