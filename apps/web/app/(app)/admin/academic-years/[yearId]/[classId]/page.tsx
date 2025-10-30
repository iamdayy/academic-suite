// 📁 apps/web/app/(app)/admin/academic-years/[yearId]/[classId]/page.tsx
"use client";

import { Button } from '@/components/ui/button';
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
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import api from '@/lib/api';
import { ChevronLeft, Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { toast } from "sonner";
// import { ConnectStudentDialog } from '@/components/dialogs/ConnectStudentDialog'; // <-- Kita pakai ulang komponen ini!

// Definisikan tipe data
interface Class {
  id: bigint;
  name: string;
  course: { name: string };
  lecturer: { name: string };
}
interface Student {
  id: bigint;
  name: string;
  nim: string;
}
interface RosterEntry {
  id: bigint; // ID dari baris ClassStudent
  student: Student;
}

// Tipe untuk dropdown 'Tambah Mahasiswa'
interface AllStudents {
  id: bigint;
  name: string;
  nim: string;
}

export default function RosterPage() {
  const params = useParams();
  const router = useRouter();
  const { yearId, classId } = params;

  const [cls, setCls] = useState<Class | null>(null);
  const [roster, setRoster] = useState<RosterEntry[]>([]);
  const [allStudents, setAllStudents] = useState<AllStudents[]>([]); // Untuk dropdown
  const [isLoading, setIsLoading] = useState(true);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState("");

  const fetchData = async () => {
    if (!classId) return;
    try {
      setIsLoading(true);
      const [classRes, rosterRes, studentsRes] = await Promise.all([
        api.get(`/classes/${classId}`),
        api.get(`/class-enrollment/roster/${classId}`),
        api.get('/students'), // Untuk dropdown
      ]);
      setCls(classRes.data);
      setRoster(rosterRes.data);
      setAllStudents(studentsRes.data);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
      toast.error("Terjadi kesalahan saat mengambil data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [classId]);

  // Handle Submit (Tambah Mahasiswa ke Roster)
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) return;
    setIsSubmitting(true);
    try {
      await api.post('/class-enrollment/enroll', {
        studentId: Number(selectedStudentId),
        classId: Number(classId),
      });
      toast.success("Mahasiswa berhasil ditambahkan.");
      setIsDialogOpen(false);
      setSelectedStudentId("");
      fetchData(); // Refresh tabel

    } catch (error: any) {
      console.error("Gagal menambah:", error);
      toast.error("Terjadi kesalahan saat menambah mahasiswa.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Hapus (Keluarkan Mahasiswa dari Roster)
  const handleDelete = async (enrollmentId: bigint) => {
    if (!confirm("Yakin ingin mengeluarkan mahasiswa ini dari kelas?")) return;
    try {
      await api.delete(`/class-enrollment/${enrollmentId}`);
      toast.success("Mahasiswa berhasil dikeluarkan.");
      fetchData(); // Refresh tabel
    } catch (error: any) {
      console.error("Gagal menghapus:", error);
      toast.error("Terjadi kesalahan saat menghapus mahasiswa.");
    }
  };

  if (isLoading) {
    return <div className="flex justify-center mt-10"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  if (!cls) return <p>Kelas tidak ditemukan.</p>;

  return (
    <div>
      <Button variant="outline" size="sm" onClick={() => router.push(`/admin/academic-years/${yearId}`)} className="mb-4">
        <ChevronLeft className="h-4 w-4 mr-2" />
        Kembali ke Daftar Kelas
      </Button>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Roster Kelas: {cls.name}</CardTitle>
          <CardDescription>
            {cls.course.name} - Diajar oleh: {cls.lecturer.name}
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Daftar Mahasiswa ({roster.length})</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Tambah Mahasiswa
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Tambah Mahasiswa ke Roster</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Label htmlFor="student">Pilih Mahasiswa</Label>
                <Select value={selectedStudentId} onValueChange={setSelectedStudentId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Mahasiswa..." />
                  </SelectTrigger>
                  <SelectContent>
                    {allStudents
                      // Filter mahasiswa yang BELUM ada di roster
                      .filter(s => !roster.some(r => r.student.id === s.id))
                      .map((student) => (
                      <SelectItem key={student.id.toString()} value={student.id.toString()}>
                        {student.name} ({student.nim})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <DialogClose asChild><Button type="button" variant="secondary">Batal</Button></DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Tambahkan
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>NIM</TableHead>
            <TableHead>Nama Mahasiswa</TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roster.map((entry) => (
            <TableRow key={entry.id.toString()}>
              <TableCell>{entry.student.nim}</TableCell>
              <TableCell className="font-medium">{entry.student.name}</TableCell>
              <TableCell>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleDelete(entry.id)}
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