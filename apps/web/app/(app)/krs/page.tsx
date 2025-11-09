// 📁 apps/web/app/krs/page.tsx
"use client";

import { CreateKrsDialog } from "@/components/dialogs/CreateKRSDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import Link from "next/link";
import { useEffect, useState } from "react";

// Definisikan tipe untuk data yang kita harapkan
// Ini bisa dipindahkan ke shared-types nanti
interface KrsHeader {
  id: bigint;
  status: string;
  semester: number;
  academicYear: {
    year: string;
    semester: string;
  };
  krsDetails: any[]; // Kita hanya butuh jumlah SKS
}

export default function KrsHistoryPage() {
  const [krsHeaders, setKrsHeaders] = useState<KrsHeader[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await api.get("/krs-headers/my");
      setKrsHeaders(response.data);
    } catch (error) {
      console.error("Gagal mengambil data KRS:", error);
      // Nanti kita bisa tambahkan komponen Toast/Alert di sini
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Helper untuk menghitung total SKS (nanti)
  const calculateTotalCredits = (details: any[]) => {
    // Logika ini perlu disempurnakan saat 'course' menyertakan SKS
    return details.reduce((acc, detail) => acc + detail.course.credits, 0);
  };

  // Helper untuk warna Badge
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "default"; // Hijau (default)
      case "REJECTED":
        return "destructive"; // Merah
      case "DRAFT":
        return "secondary"; // Abu-abu
      default:
        return "outline";
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        Riwayat Kartu Rencana Studi (KRS)
      </h1>

      {/* Tombol untuk 'Isi KRS Baru' */}
      <CreateKrsDialog onSuccess={fetchData} />

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
              <TableHead>Status</TableHead>
              <TableHead>Total SKS</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {krsHeaders.map((header) => (
              <TableRow key={header.id.toString()}>
                <TableCell>
                  {header.academicYear.year} ({header.academicYear.semester})
                </TableCell>
                <TableCell>{header.semester}</TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(header.status)}>
                    {header.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {calculateTotalCredits(header.krsDetails)} SKS
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/krs/${header.id}`}>Lihat Detail</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {!isLoading && krsHeaders.length === 0 && (
        <p className="text-center text-muted-foreground mt-10">
          Anda belum memiliki riwayat KRS.
        </p>
      )}
    </div>
  );
}
