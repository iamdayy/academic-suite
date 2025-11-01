// 📁 apps/web/app/(app)/admin/academics/[majorId]/[prodiId]/page.tsx
"use client";

import { EditCurriculumDialog } from "@/components/dialogs/EditCurriculumDialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import api from "@/lib/api";
import { ChevronLeft, Loader2, PlusCircle, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
// import { BreadcrumbNav } from '@/components/BreadcrumbNav'; // <-- Kita akan buat ini nanti

// Definisikan tipe data
interface StudyProgram {
  id: bigint;
  name: string;
  level: string;
}
interface Curriculum {
  id: bigint;
  name: string;
  year: number;
}

export default function ProdiDetailPage() {
  const params = useParams();
  const router = useRouter();
  const majorId = params.majorId as string;
  const prodiId = params.studyProgramId as string;

  // State untuk data
  const [prodi, setProdi] = useState<StudyProgram | null>(null);
  const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State untuk dialog form
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newName, setNewName] = useState("");
  const [newYear, setNewYear] = useState("");

  // Fungsi untuk mengambil data
  const fetchData = async () => {
    if (!prodiId) return;
    try {
      setIsLoading(true);
      const [prodiRes, curriculumsRes] = await Promise.all([
        api.get(`/study-programs/${prodiId}`),
        api.get(`/curriculums?studyProgramId=${prodiId}`), // <-- Gunakan API baru
      ]);
      setProdi(prodiRes.data);
      setCurriculums(curriculumsRes.data);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
      toast.error("Gagal mengambil data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [prodiId]);

  // Fungsi untuk submit form Kurikulum
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post("/curriculums", {
        name: newName,
        year: Number(newYear),
        studyProgramId: Number(prodiId),
      });
      toast.success("Kurikulum berhasil ditambahkan.");
      setIsDialogOpen(false);
      setNewName("");
      setNewYear("");
      fetchData(); // Refresh tabel
    } catch (error: any) {
      console.error("Gagal menambah kurikulum:", error);
      toast.error(error.response.data.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCurriculum = async (curId: bigint, curName: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus kurikulum "${curName}"?`)) {
      return;
    }

    try {
      await api.delete(`/curriculums/${curId}`);
      toast.success(`Kurikulum "${curName}" berhasil dihapus.`);
      fetchData(); // Refresh tabel
    } catch (error: any) {
      console.error("Gagal menghapus kurikulum:", error);
      toast.error(error.response.data.message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center mt-10">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  if (!prodi) return <p>Program Studi tidak ditemukan.</p>;

  return (
    <div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => router.push(`/admin/academics/${majorId}`)}
        className="mb-4"
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        Kembali ke Daftar Prodi
      </Button>

      {/* Card Detail Prodi (Induk) */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>
            Prodi: {prodi.name} ({prodi.level})
          </CardTitle>
          <CardDescription>
            Kelola semua kurikulum di bawah prodi ini.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Bagian Tabel Kurikulum (Anak) */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Kurikulum</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Tambah Kurikulum
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  Tambah Kurikulum Baru (Prodi: {prodi.name})
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Kurikulum</Label>
                  <Input
                    id="name"
                    placeholder="Kurikulum 2024"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Tahun</Label>
                  <Input
                    id="year"
                    type="number"
                    placeholder="2024"
                    value={newYear}
                    onChange={(e) => setNewYear(e.target.value)}
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

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Nama Kurikulum</TableHead>
            <TableHead>Tahun</TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {curriculums.map((cur) => (
            <TableRow key={cur.id.toString()}>
              <TableCell>{cur.id.toString()}</TableCell>
              <TableCell className="font-medium">{cur.name}</TableCell>
              <TableCell>{cur.year}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm" asChild>
                  <Link
                    href={`/admin/academics/${majorId}/${prodiId}/${cur.id}`}
                  >
                    Kelola Mata Kuliah
                  </Link>
                </Button>

                <EditCurriculumDialog curriculum={cur} onSuccess={fetchData} />

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteCurriculum(cur.id, cur.name)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
