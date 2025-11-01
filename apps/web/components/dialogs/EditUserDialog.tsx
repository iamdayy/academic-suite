// 📁 apps/web/components/EditUserDialog.tsx
"use client";

import { Button } from "@/components/ui/button";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/lib/api";
import { Edit, Loader2 } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Role } from "shared-types";
import { toast } from "sonner";

// Definisikan tipe data
interface ApiRole {
  id: bigint;
  roleName: Role;
}
interface User {
  id: bigint;
  email: string;
  role: ApiRole;
}

// Definisikan props
interface EditUserDialogProps {
  user: User; // Menerima data user yang akan diedit
  roles: ApiRole[]; // Menerima daftar semua role untuk dropdown
  onSuccess: () => void; // Callback untuk refresh tabel
}

export function EditUserDialog({
  user,
  roles,
  onSuccess,
}: EditUserDialogProps) {
  // 1. Isi form dengan data yang ada
  const [email, setEmail] = useState(user.email);
  const [selectedRoleId, setSelectedRoleId] = useState(user.role.id.toString());

  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Sinkronkan state jika prop berubah
  useEffect(() => {
    setEmail(user.email);
    setSelectedRoleId(user.role.id.toString());
  }, [user]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 2. Panggil API PATCH (Update)
      // Catatan: Endpoint /users/:id (PATCH) belum kita buat
      // Kita akan asumsikan itu ada
      await api.patch(`/users/${user.id}`, {
        email: email,
        roleId: Number(selectedRoleId),
      });

      toast.success("Berhasil mengupdate user!");

      setIsOpen(false); // Tutup dialog
      onSuccess(); // Panggil callback untuk refresh data!
    } catch (error: any) {
      console.error("Gagal mengupdate user:", error);
      toast.error("Gagal mengupdate user");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit User: {user.email}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Peran (Role)</Label>
              <Select
                value={selectedRoleId}
                onValueChange={setSelectedRoleId}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Peran" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem
                      key={role.id.toString()}
                      value={role.id.toString()}
                    >
                      {role.roleName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Kita tidak mengizinkan pengubahan password dari sini */}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Batal
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
