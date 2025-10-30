// 📁 apps/web/app/admin/users/page.tsx
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
import { AuthenticatedUser, Role } from 'shared-types'; // Impor tipe Role
import { toast } from "sonner";

// 1. Definisikan tipe data (AuthenticatedUser sudah cocok)
type User = AuthenticatedUser; 

// Tipe untuk dropdown
interface ApiRole {
  id: bigint;
  roleName: Role;
}

export default function UsersPage() {
  // 2. State untuk data
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<ApiRole[]>([]); // Untuk dropdown
  const [isLoading, setIsLoading] = useState(true);

  // 3. State untuk dialog form
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 4. State untuk form input
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState("");

  // 5. Fungsi untuk mengambil SEMUA data
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [usersRes, rolesRes] = await Promise.all([
        api.get('/users'),
        api.get('/roles') // Panggil API baru kita
      ]);
      setUsers(usersRes.data);
      setRoles(rolesRes.data);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
      toast.error('Terjadi kesalahan saat mengambil data.');
    } finally {
      setIsLoading(false);
    }
  };

  // 6. Ambil data saat komponen dimuat
  useEffect(() => {
    fetchData();
  }, []);

  // 7. Fungsi untuk submit form
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedRoleId || !newEmail || !newPassword) {
        toast.error('Mohon isi semua field.');
      return;
    }
    setIsSubmitting(true);

    try {
      // Panggil endpoint 'POST /users' yang sudah kita buat lama
      await api.post('/users', {
        email: newEmail,
        password: newPassword,
        roleId: Number(selectedRoleId),
      });
      toast.success('User berhasil ditambahkan.')

      setIsDialogOpen(false); // Tutup dialog
      // Reset form
      setNewEmail("");
      setNewPassword("");
      setSelectedRoleId("");
      fetchData(); // Ambil ulang data

    } catch (error: any) {
      console.error("Gagal menambah user:", error);
      toast.error('Terjadi kesalahan saat menambah user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manajemen User</h1>

        {/* 8. Tombol & Dialog untuk Tambah Baru */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Tambah User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Tambah User Baru</DialogTitle>
                <DialogDescription>
                  Buat akun user baru. Anda harus membuat profil
                  (Student/Lecturer) terpisah setelah ini.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {/* Input Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    required
                  />
                </div>
                {/* Input Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                {/* Select Role */}
                <div className="space-y-2">
                  <Label htmlFor="role">Peran (Role)</Label>
                  <Select value={selectedRoleId} onValueChange={setSelectedRoleId} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Peran" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id.toString()} value={role.id.toString()}>
                          {role.roleName}
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
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
              <TableHead>Email</TableHead>
              <TableHead>Peran (Role)</TableHead>
              <TableHead>Profil Terhubung</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id.toString()}>
                <TableCell>{user.id.toString()}</TableCell>
                <TableCell className="font-medium">{user.email}</TableCell>
                <TableCell>{user.role.roleName}</TableCell>
                <TableCell>
                  {user.student ? `Student: ${user.student.name}` : 
                   user.lecturer ? `Lecturer: ${user.lecturer.name}` : 
                   'N/A'}
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