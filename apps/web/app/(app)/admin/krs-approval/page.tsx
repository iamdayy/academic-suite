// 📁 apps/web/app/(app)/admin/krs-approval/page.tsx
"use client";

import { ChangeKrsStatusDialog } from "@/components/dialogs/ChangeKRSStatusDialog";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import api from "@/lib/api";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// Definisikan tipe data
interface KrsHeader {
  id: bigint;
  status: string;
  semester: number;
  academicYear: { year: string; semester: string };
  student: { name: string; nim: string };
}

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

export default function KrsApprovalPage() {
  const [krsHeaders, setKrsHeaders] = useState<KrsHeader[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      // Panggil API GET /krs-headers (Admin akan dapat semua)
      const response = await api.get("/krs-headers");
      setKrsHeaders(response.data);
    } catch (error) {
      console.error("Gagal mengambil data KRS:", error);
      toast.error("Terjadi kesalahan saat mengambil data KRS.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        Persetujuan Kartu Rencana Studi (KRS)
      </h1>

      {isLoading ? (
        <div className="flex justify-center mt-10">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mahasiswa (NIM)</TableHead>
              <TableHead>Tahun Ajaran</TableHead>
              <TableHead>Semester Ke-</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {krsHeaders.map((header) => (
              <TableRow key={header.id.toString()}>
                <TableCell className="font-medium">
                  {header.student.name} ({header.student.nim})
                </TableCell>
                <TableCell>
                  {header.academicYear.year} ({header.academicYear.semester})
                </TableCell>
                <TableCell>{header.semester}</TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(header.status)}>
                    {header.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <ChangeKrsStatusDialog
                    krsHeader={header}
                    onSuccess={fetchData}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
