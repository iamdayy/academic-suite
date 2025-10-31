// 📁 apps/web/app/(app)/admin/lecturers/page.tsx
"use client";

import { Button } from '@/components/ui/button';
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
import api from '@/lib/api';
import { Loader2, PlusCircle } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { AuthenticatedUser, Role } from 'shared-types';
import { toast } from "sonner";

// Definisikan tipe data
interface Lecturer {
  id: bigint;
  name: string;
  nidn: string;
  user: {
    email: string;
  };
}
type User = AuthenticatedUser;

export default function LecturersPage() {
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [users, setUsers] = useState<User[]>([]); // Untuk dropdown
  const [isLoading, setIsLoading] = useState(true);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newName, setNewName] = useState("");
  const [newNidn, setNewNidn] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [lecturersRes, usersRes] = await Promise.all([
        api.get('/lecturers'),
        api.get('/users') // Ambil semua user
      ]);
      setLecturers(lecturersRes.data);
      // Filter user yang rolenya LECTURER dan belum punya profil
      setUsers(
        usersRes.data.filter(
          (user: User) => user.role.roleName === Role.LECTURER && !user.lecturer
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
    if (!selectedUserId || !newName || !newNidn) {
      toast.error("Semua field harus diisi.");
      return;
    }
    setIsSubmitting(true);

    try {
      await api.post('/lecturers', {
        name: newName,
        nidn: newNidn,
        userId: Number(selectedUserId),
      });
      toast.success("Profil dosen berhasil ditambahkan.");
      
      setIsDialogOpen(false);
      setNewName("");
      setNewNidn("");
      setSelectedUserId("");
      fetchData(); // Refresh data

    } catch (error: any) {
      console.error("Gagal menambah dosen:", error);
      toast.error("Terjadi kesalahan saat menambah dosen.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manajemen Dosen (Lecturer)</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Buat Profil Dosen
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Buat Profil Dosen Baru</DialogTitle>
                <DialogDescription>
                  Hubungkan Akun User (Lecturer) dengan profil dosen.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="user">Akun User (Lecturer)</Label>
                  <Select value={selectedUserId} onValueChange={setSelectedUserId} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Akun User..." />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id.toString()} value={user.id.toString()}>
                          {user.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Lengkap Dosen</Label>
                  <Input
                    id="name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nidn">NIDN</Label>
                  <Input
                    id="nidn"
                    value={newNidn}
                    onChange={(e) => setNewNidn(e.target.value)}
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
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
              <TableHead>NIDN</TableHead>
              <TableHead>Nama Dosen</TableHead>
              <TableHead>Email Akun</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lecturers.map((lecturer) => (
              <TableRow key={lecturer.id.toString()}>
                <TableCell>{lecturer.id.toString()}</TableCell>
                <TableCell>{lecturer.nidn}</TableCell>
                <TableCell className="font-medium">{lecturer.name}</TableCell>
                <TableCell>{lecturer.user.email}</TableCell>
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