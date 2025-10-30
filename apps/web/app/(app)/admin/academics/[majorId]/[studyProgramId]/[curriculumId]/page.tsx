// 📁 apps/web/app/(app)/admin/academics/[majorId]/[prodiId]/[curriculumId]/page.tsx
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
import api from '@/lib/api';
import { ChevronLeft, Loader2, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { toast } from "sonner";

// Definisikan tipe data
interface Curriculum { id: bigint; name: string; year: number; }
interface Course { id: bigint; code: string; name: string; credits: number; semester: number; }

export default function CurriculumDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { majorId, studyProgramId: prodiId, curriculumId } = params;

  // State untuk data
  const [curriculum, setCurriculum] = useState<Curriculum | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State untuk dialog form
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [newCredits, setNewCredits] = useState("");
  const [newSemester, setNewSemester] = useState("");

  // Fungsi untuk mengambil data
  const fetchData = async () => {
    if (!curriculumId) return;
    try {
      setIsLoading(true);
      const [curriculumRes, coursesRes] = await Promise.all([
        api.get(`/curriculums/${curriculumId}`),
        api.get(`/courses?curriculumId=${curriculumId}`) // <-- Gunakan API baru
      ]);
      setCurriculum(curriculumRes.data);
      setCourses(coursesRes.data);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
      toast.error("Gagal mengambil data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [curriculumId]);

  // Fungsi untuk submit form Mata Kuliah
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/courses', {
        code: newCode,
        name: newName,
        credits: Number(newCredits),
        semester: Number(newSemester),
        curriculumId: Number(curriculumId), 
      });
      toast.success("Mata kuliah berhasil ditambahkan.");
      setIsDialogOpen(false);
      // Reset form
      setNewCode("");
      setNewName("");
      setNewCredits("");
      setNewSemester("");
      fetchData(); // Refresh tabel

    } catch (error: any) {
      console.error("Gagal menambah mata kuliah:", error);
      toast.error(error.response.data.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center mt-10"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  if (!curriculum) return <p>Kurikulum tidak ditemukan.</p>;

  return (
    <div>
      <Button variant="outline" size="sm" onClick={() => router.push(`/admin/academics/${majorId}/${prodiId}`)} className="mb-4">
        <ChevronLeft className="h-4 w-4 mr-2" />
        Kembali ke Daftar Kurikulum
      </Button>

      {/* Card Detail Kurikulum (Induk) */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Kurikulum: {curriculum.name} ({curriculum.year})</CardTitle>
          <CardDescription>
            Kelola semua mata kuliah di bawah kurikulum ini.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Bagian Tabel Mata Kuliah (Anak) */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Mata Kuliah</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Tambah Mata Kuliah
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Tambah Mata Kuliah Baru</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {/* Form sama seperti yang kita buat di halaman /admin/courses lama */}
                <div className="space-y-2">
                  <Label htmlFor="code">Kode MK</Label>
                  <Input id="code" placeholder="IF101" value={newCode} onChange={(e) => setNewCode(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Mata Kuliah</Label>
                  <Input id="name" placeholder="Dasar Pemrograman" value={newName} onChange={(e) => setNewName(e.target.value)} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="credits">SKS</Label>
                    <Input id="credits" type="number" placeholder="3" value={newCredits} onChange={(e) => setNewCredits(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="semester">Semester</Label>
                    <Input id="semester" type="number" placeholder="1" value={newSemester} onChange={(e) => setNewSemester(e.target.value)} required />
                  </div>
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
            <TableHead>Kode</TableHead>
            <TableHead>Nama Mata Kuliah</TableHead>
            <TableHead>SKS</TableHead>
            <TableHead>Sem</TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {courses.map((course) => (
            <TableRow key={course.id.toString()}>
              <TableCell>{course.code}</TableCell>
              <TableCell className="font-medium">{course.name}</TableCell>
              <TableCell>{course.credits}</TableCell>
              <TableCell>{course.semester}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm" asChild>
                  {/* Link ke Halaman Prasyarat */}
                  <Link href={`/admin/academics/${majorId}/${prodiId}/${curriculumId}/${course.id}`}>
                    Kelola Prasyarat
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