// 📁 apps/web/app/(app)/krs/[id]/page.tsx
"use client";

import { AddClassToKrsDialog } from "@/components/dialogs/AddClassToKRSDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import api from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { ChevronLeft, Loader2, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// Definisikan tipe data (sama seperti di /guardian)
interface KrsDetail {
  id: bigint;
  class: {
    // Ini sekarang 'class'
    id: bigint;
    name: string; // "Kelas A"
    course: {
      // Mata kuliah ada di dalam 'class'
      code: string;
      name: string;
      credits: number;
    };
  };
  grade: string | null;
}
interface KrsHeader {
  id: bigint;
  status: string;
  semester: number;
  academicYear: { year: string; semester: string; id: bigint };
  krsDetails: KrsDetail[];
}

// Helper untuk hitung IPK (Sederhana)
const calculateIPS = (details: KrsDetail[]) => {
  let totalSKS = 0;
  let totalBobot = 0;
  const gradeMap: { [key: string]: number } = { A: 4, B: 3, C: 2, D: 1, E: 0 };

  details.forEach((detail) => {
    if (detail.grade && gradeMap[detail.grade] !== undefined) {
      const sks = detail.class.course.credits; // <-- Ambil SKS dari class.course
      if (sks) {
        totalSKS += sks;
        totalBobot += gradeMap[detail.grade]! * sks;
      }
    }
  });
  return totalSKS > 0 ? (totalBobot / totalSKS).toFixed(2) : "N/A";
};

// Helper untuk warna Badge
const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "APPROVED":
      return "default";
    case "REJECTED":
      return "destructive";
    case "DRAFT":
      return "secondary";
    default:
      return "outline";
  }
};

export default function KrsDetailPage() {
  const params = useParams();
  const router = useRouter();
  const krsId = params.id as string;
  const { user, isLoading: isAuthLoading } = useAuthStore();

  const [krs, setKrs] = useState<KrsHeader | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [ips, setIps] = useState("N/A");

  // 3. Modifikasi fetchData agar bisa dipanggil ulang
  const fetchData = async () => {
    if (isAuthLoading || !user || !krsId) return;

    setIsLoading(true); // Set loading setiap kali
    try {
      const response = await api.get(`/krs-headers/${krsId}`);
      setKrs(response.data);
      setIps(calculateIPS(response.data.krsDetails));
    } catch (error: any) {
      // ... (error handling)
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [krsId, isAuthLoading, user, router]); // <-- Jalankan fetchData

  // 4. Buat fungsi Hapus
  const handleDeleteDetail = async (krsDetailId: bigint, className: string) => {
    if (!confirm(`Yakin ingin menghapus kelas "${className}" dari KRS ini?`))
      return;

    try {
      await api.delete(`/krs-details/${krsDetailId}`);
      toast.success(`Kelas "${className}" berhasil dihapus dari KRS.`);
      fetchData(); // Refresh tabel
    } catch (error: any) {
      toast.error("Gagal menghapus kelas dari KRS.");
      console.error(error);
    }
  };

  const existingClassIds =
    krs?.krsDetails.map((detail) => detail.class.id) || [];

  if (isLoading || isAuthLoading) {
    return (
      <div className="flex justify-center mt-10">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  if (!krs)
    return <p>Data KRS tidak ditemukan atau Anda tidak memiliki akses.</p>;

  return (
    <div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => router.push("/krs")}
        className="mb-4"
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        Kembali ke Riwayat KRS
      </Button>

      {/* Info KRS */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>
            Detail KRS: {krs.academicYear.year} - {krs.academicYear.semester}
          </CardTitle>
          <CardDescription>Semester ke-{krs.semester}</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-muted-foreground">Status</span>
            <p>
              <Badge variant={getStatusBadgeVariant(krs.status)}>
                {krs.status}
              </Badge>
            </p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">
              IPS (Indeks Prestasi Semester)
            </span>
            <p className="text-2xl font-bold">{ips}</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Daftar Mata Kuliah</h2>
        {/* 5. Tambahkan Dialog (hanya jika status DRAFT) */}
        {krs.status === "DRAFT" && (
          <AddClassToKrsDialog
            krsHeaderId={krs.id}
            academicYearId={krs.academicYear.id}
            existingClassIds={existingClassIds}
            onSuccess={fetchData}
          />
        )}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Kode MK</TableHead>
            <TableHead>Nama Mata Kuliah</TableHead>
            <TableHead>SKS</TableHead>
            <TableHead>Nilai</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {krs.krsDetails.map((detail, index) => (
            <TableRow key={`${detail.class.course.code}-${index}`}>
              <TableCell>{detail.class.course.code}</TableCell>
              <TableCell>{detail.class.course.name}</TableCell>
              <TableCell>{detail.class.course.credits}</TableCell>
              <TableCell>
                <Badge variant={detail.grade ? "default" : "outline"}>
                  {detail.grade || "Belum Keluar"}
                </Badge>
              </TableCell>
              {krs.status === "DRAFT" && (
                <TableCell className="text-right">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() =>
                      handleDeleteDetail(detail.id, detail.class.course.name)
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
