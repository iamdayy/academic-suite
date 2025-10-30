// 📁 apps/web/app/(app)/admin/academics/[majorId]/page.tsx
"use client";

import { Button } from '@/components/ui/button';
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
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
import api from '@/lib/api';
import { ChevronLeft, Loader2, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { toast } from "sonner";

// Definisikan tipe data
interface Major { id: bigint; name: string; }
interface StudyProgram { id: bigint; name: string; level: string; }

export default function MajorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const majorId = params.majorId as string;

  // State untuk data
  const [major, setMajor] = useState<Major | null>(null);
  const [studyPrograms, setStudyPrograms] = useState<StudyProgram[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State untuk dialog form
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newName, setNewName] = useState("");
  const [newLevel, setNewLevel] = useState("");

  // Fungsi untuk mengambil data
  const fetchData = async () => {
    if (!majorId) return;
    try {
      setIsLoading(true);
      // Panggil 2 API: detail major DAN daftar prodi yang difilter
      const [majorRes, prodiRes] = await Promise.all([
        api.get(`/majors/${majorId}`),
        api.get(`/study-programs?majorId=${majorId}`) // <-- Gunakan API baru
      ]);
      setMajor(majorRes.data);
      setStudyPrograms(prodiRes.data);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
      toast.error("Gagal mengambil data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [majorId]);

  // Fungsi untuk submit form Prodi
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Panggil API POST /study-programs
      // majorId diambil dari URL, bukan dropdown
      await api.post('/study-programs', {
        name: newName,
        level: newLevel,
        majorId: Number(majorId), 
      });
      toast.success("Prodi berhasil ditambahkan.");
      setIsDialogOpen(false);
      setNewName("");
      setNewLevel("");
      fetchData(); // Refresh tabel

    } catch (error: any) {
      console.error("Gagal menambah prodi:", error);
      toast.error(error.response.data.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center mt-10"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  if (!major) return <p>Jurusan tidak ditemukan.</p>;

  return (
    <div>
      <Button variant="outline" size="sm" onClick={() => router.push('/admin/academics')} className="mb-4">
        <ChevronLeft className="h-4 w-4 mr-2" />
        Kembali ke Daftar Jurusan
      </Button>

      {/* Card Detail Jurusan (Induk) */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Jurusan: {major.name}</CardTitle>
          <CardDescription>
            Kelola semua program studi di bawah jurusan ini.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Bagian Tabel Program Studi (Anak) */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Program Studi</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Tambah Prodi
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Tambah Prodi Baru (Jurusan: {major.name})</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Prodi</Label>
                  <Input id="name" value={newName} onChange={(e) => setNewName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="level">Jenjang</Label>
                  <Input id="level" placeholder="Contoh: S1" value={newLevel} onChange={(e) => setNewLevel(e.target.value)} required />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild><Button type="button" variant="secondary">Batal</Button></DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
            <TableHead>Nama Prodi</TableHead>
            <TableHead>Jenjang</TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {studyPrograms.map((prodi) => (
            <TableRow key={prodi.id.toString()}>
              <TableCell>{prodi.id.toString()}</TableCell>
              <TableCell className="font-medium">{prodi.name}</TableCell>
              <TableCell>{prodi.level}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm" asChild>
                  {/* Link ke Level 3 */}
                  <Link href={`/admin/academics/${majorId}/${prodi.id}`}>
                    Kelola Kurikulum
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}