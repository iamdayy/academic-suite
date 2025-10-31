// 📁 apps/web/app/(app)/admin/students/page.tsx
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
import api from "@/lib/api";
import { Loader2, PlusCircle } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { AuthenticatedUser, Role } from "shared-types";
import { toast } from "sonner";

// Definisikan tipe data
interface StudyProgram {
  id: bigint;
  name: string;
  level: string;
}
interface Student {
  id: bigint;
  name: string;
  nim: string;
  user: {
    // user bisa null jika belum aktivasi
    email: string;
  } | null;
  studyProgram: {
    name: string;
  };
}
type User = AuthenticatedUser;

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [users, setUsers] = useState<User[]>([]); // Untuk dropdown user
  const [studyPrograms, setStudyPrograms] = useState<StudyProgram[]>([]); // Untuk dropdown prodi
  const [isLoading, setIsLoading] = useState(true);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State untuk form
  const [newName, setNewName] = useState("");
  const [newNim, setNewNim] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(""); // Ini opsional sekarang
  const [selectedProdiId, setSelectedProdiId] = useState("");

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [studentsRes, usersRes, prodiRes] = await Promise.all([
        api.get("/students"),
        api.get("/users"),
        api.get("/study-programs"),
      ]);
      setStudents(studentsRes.data);
      setStudyPrograms(prodiRes.data);
      // Filter user yang rolenya STUDENT dan belum punya profil
      setUsers(
        usersRes.data.filter(
          (user: User) => user.role.roleName === Role.STUDENT && !user.student
        )
      );
    } catch (error) {
      console.error("Gagal mengambil data:", error);
      toast.error("Terjadi kesalahan saat mengambil data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedProdiId || !newName || !newNim) {
      toast.error("Semua field harus diisi.");
      return;
    }
    setIsSubmitting(true);

    // Siapkan data DTO
    const studentData: any = {
      name: newName,
      nim: newNim,
      studyProgramId: Number(selectedProdiId),
    };

    // 'userId' bersifat opsional. Hanya tambahkan jika Admin memilihnya.
    if (selectedUserId) {
      studentData.userId = Number(selectedUserId);
    }

    try {
      await api.post("/students", studentData); // API sudah kita buat lama
      toast.success("Profil mahasiswa berhasil ditambahkan.");

      setIsDialogOpen(false);
      setNewName("");
      setNewNim("");
      setSelectedUserId("");
      setSelectedProdiId("");
      fetchData(); // Refresh data
    } catch (error: any) {
      console.error("Gagal menambah mahasiswa:", error);
      toast.error("Terjadi kesalahan saat menambah mahasiswa.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manajemen Mahasiswa (Student)</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Buat Profil Mahasiswa
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Buat Profil Mahasiswa Baru</DialogTitle>
                <DialogDescription>
                  Mahasiswa dapat mendaftar (aktivasi akun) menggunakan NIM
                  setelah profil ini dibuat.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="nim">NIM</Label>
                  <Input
                    id="nim"
                    value={newNim}
                    onChange={(e) => setNewNim(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Lengkap Mahasiswa</Label>
                  <Input
                    id="name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prodi">Program Studi</Label>
                  <Select
                    value={selectedProdiId}
                    onValueChange={setSelectedProdiId}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Program Studi..." />
                    </SelectTrigger>
                    <SelectContent>
                      {studyPrograms.map((prodi) => (
                        <SelectItem
                          key={prodi.id.toString()}
                          value={prodi.id.toString()}
                        >
                          {prodi.name} ({prodi.level})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user">Akun User (Opsional)</Label>
                  <Select
                    value={selectedUserId}
                    onValueChange={setSelectedUserId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Akun (jika sudah ada)..." />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem
                          key={user.id.toString()}
                          value={user.id.toString()}
                        >
                          {user.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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

      {isLoading ? (
        <div className="flex justify-center mt-10">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>NIM</TableHead>
              <TableHead>Nama Mahasiswa</TableHead>
              <TableHead>Prodi</TableHead>
              <TableHead>Status Akun</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id.toString()}>
                <TableCell>{student.id.toString()}</TableCell>
                <TableCell>{student.nim}</TableCell>
                <TableCell className="font-medium">{student.name}</TableCell>
                <TableCell>{student.studyProgram.name}</TableCell>
                <TableCell>
                  {student.user ? (
                    student.user.email
                  ) : (
                    <span className="text-yellow-500">Belum Aktivasi</span>
                  )}
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm">
                    Edit
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
