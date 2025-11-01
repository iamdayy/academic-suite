// 📁 apps/web/app/(app)/admin/guardians/page.tsx
"use client";

import { ConnectStudentDialog } from "@/components/dialogs/ConnectStudentDialog";
import { EditGuardianDialog } from "@/components/dialogs/EditGuardianDialog";
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
import { Loader2, PlusCircle, Trash2 } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { AuthenticatedUser, Role } from "shared-types";
import { toast } from "sonner";

// Definisikan tipe data
interface Guardian {
  id: bigint;
  name: string;
  phone: string | null;
  user: {
    email: string;
  };
  students: { student: { name: string } }[]; // Daftar anak
}
type User = AuthenticatedUser;

export default function GuardiansPage() {
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [users, setUsers] = useState<User[]>([]); // Untuk dropdown
  const [isLoading, setIsLoading] = useState(true);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [guardiansRes, usersRes] = await Promise.all([
        api.get("/guardians"),
        api.get("/users"), // Ambil semua user
      ]);
      setGuardians(guardiansRes.data);
      // Filter user yang rolenya GUARDIAN dan belum punya profil
      setUsers(
        usersRes.data.filter(
          (user: User) => user.role.roleName === Role.GUARDIAN && !user.guardian
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
    if (!selectedUserId || !newName) {
      toast.error("Semua field harus diisi.");
      return;
    }
    setIsSubmitting(true);

    try {
      await api.post("/guardians", {
        name: newName,
        phone: newPhone,
        userId: Number(selectedUserId),
      });
      toast.success("Profil wali berhasil ditambahkan.");

      setIsDialogOpen(false);
      setNewName("");
      setNewPhone("");
      setSelectedUserId("");
      fetchData(); // Refresh data
    } catch (error: any) {
      console.error("Gagal menambah wali:", error);
      toast.error("Terjadi kesalahan saat menambah wali.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (guardianId: bigint, guardianName: string) => {
    if (
      !confirm(
        `Apakah Anda yakin ingin menghapus profil wali "${guardianName}"? Ini tidak akan menghapus akun User-nya.`
      )
    ) {
      return;
    }

    try {
      await api.delete(`/guardians/${guardianId}`); // API ini sudah ada
      toast.success("Profil wali berhasil dihapus.");
      fetchData(); // Refresh tabel
    } catch (error: any) {
      console.error("Gagal menghapus wali:", error);
      toast.error("Terjadi kesalahan saat menghapus wali.");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manajemen Wali (Guardian)</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Buat Profil Wali
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Buat Profil Wali Baru</DialogTitle>
                <DialogDescription>
                  Hubungkan Akun User (Guardian) dengan profil wali.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="user">Akun User (Guardian)</Label>
                  <Select
                    value={selectedUserId}
                    onValueChange={setSelectedUserId}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Akun User..." />
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
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Lengkap Wali</Label>
                  <Input
                    id="name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">No. Telepon (Opsional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
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

      {isLoading ? (
        <div className="flex justify-center mt-10">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Nama Wali</TableHead>
              <TableHead>No. Telepon</TableHead>
              <TableHead>Email Akun</TableHead>
              <TableHead>Mahasiswa Terhubung</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {guardians.map((g) => (
              <TableRow key={g.id.toString()}>
                <TableCell>{g.id.toString()}</TableCell>
                <TableCell className="font-medium">{g.name}</TableCell>
                <TableCell>{g.phone || "-"}</TableCell>
                <TableCell>{g.user.email}</TableCell>
                <TableCell>
                  {g.students.map((s) => s.student.name).join(", ") || "-"}
                </TableCell>
                <TableCell>
                  <ConnectStudentDialog
                    guardianId={g.id}
                    guardianName={g.name}
                    onSuccess={fetchData} // Panggil fungsi refresh!
                  />
                  <EditGuardianDialog guardian={g} onSuccess={fetchData} />

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(g.id, g.name)}
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
