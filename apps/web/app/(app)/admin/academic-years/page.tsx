// 📁 apps/web/app/(app)/admin/academic-years/page.tsx
"use client";

import { EditAcademicYearDialog } from "@/components/dialogs/EditAcademicYearDialog";
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

interface AcademicYear {
  id: bigint;
  year: string;
  semester: string;
  startDate: string;
  endDate: string;
}

export default function AcademicYearsPage() {
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State untuk form
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newYear, setNewYear] = useState("");
  const [newSemester, setNewSemester] = useState("");
  const [newStartDate, setNewStartDate] = useState("");
  const [newEndDate, setNewEndDate] = useState("");

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/academic-years");
      setYears(response.data);
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
    setIsSubmitting(true);
    try {
      await api.post("/academic-years", {
        year: newYear,
        semester: newSemester,
        startDate: new Date(newStartDate), // DTO kita menerima Tipe Date
        endDate: new Date(newEndDate),
      });
      toast.success("Tahun ajaran berhasil ditambahkan.");
      setIsDialogOpen(false);
      setNewYear("");
      setNewSemester("");
      setNewStartDate("");
      setNewEndDate("");
      fetchData();
    } catch (error: any) {
      console.error("Gagal menambah:", error);
      toast.error("Terjadi kesalahan saat menambah tahun ajaran.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (yearId: bigint, yearName: string) => {
    if (
      !confirm(`Apakah Anda yakin ingin menghapus tahun ajaran "${yearName}"?`)
    ) {
      return;
    }

    try {
      await api.delete(`/academic-years/${yearId}`);
      toast.success("Tahun ajaran berhasil dihapus.");
      fetchData(); // Refresh tabel
    } catch (error: any) {
      console.error("Gagal menghapus:", error);
      toast.error("Terjadi kesalahan saat menghapus tahun ajaran.");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <main>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manajemen Tahun Ajaran</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Tambah Tahun Ajaran
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Tambah Tahun Ajaran Baru</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="year">Tahun (Cth: 2024/2025)</Label>
                  <Input
                    id="year"
                    value={newYear}
                    onChange={(e) => setNewYear(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="semester">Semester (Cth: GANJIL)</Label>
                  <Input
                    id="semester"
                    value={newSemester}
                    onChange={(e) => setNewSemester(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startDate">Tanggal Mulai</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">Tanggal Selesai</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={newEndDate}
                    onChange={(e) => setNewEndDate(e.target.value)}
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

      {isLoading ? (
        <div className="flex justify-center mt-10">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tahun Ajaran</TableHead>
              <TableHead>Semester</TableHead>
              <TableHead>Mulai</TableHead>
              <TableHead>Selesai</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {years.map((year) => (
              <TableRow key={year.id.toString()}>
                <TableCell className="font-medium">{year.year}</TableCell>
                <TableCell>{year.semester}</TableCell>
                <TableCell>{formatDate(year.startDate)}</TableCell>
                <TableCell>{formatDate(year.endDate)}</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/academic-years/${year.id}`}>
                      Kelola Kelas
                    </Link>
                  </Button>
                  <EditAcademicYearDialog
                    academicYear={year}
                    onSuccess={fetchData}
                  />

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() =>
                      handleDelete(year.id, `${year.year} ${year.semester}`)
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </main>
  );
}
