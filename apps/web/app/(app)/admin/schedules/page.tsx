"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/lib/api";
import { CalendarDays, Loader2, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface AcademicYear {
  id: bigint;
  year: string;
  semester: string;
}

export default function AutoSchedulePage() {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedYearId, setSelectedYearId] = useState<string>("");

  useEffect(() => {
    const fetchAcademicYears = async () => {
      try {
        const response = await api.get("/academic-years");
        setAcademicYears(response.data);
      } catch (error) {
        console.error("Gagal mengambil data tahun ajaran:", error);
        toast.error("Gagal mengambil data tahun ajaran.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAcademicYears();
  }, []);

  const handleGenerate = async () => {
    if (!selectedYearId) {
      toast.error("Silakan pilih tahun ajaran terlebih dahulu.");
      return;
    }

    if (
      !confirm(
        "Apakah Anda yakin ingin men-generate jadwal otomatis untuk tahun ajaran ini? Kelas yang sudah memiliki jadwal akan dilewati."
      )
    ) {
      return;
    }

    setIsGenerating(true);
    try {
      const response = await api.post("/class-schedules/generate", {
        academicYearId: Number(selectedYearId),
      });
      toast.success(response.data.message || "Jadwal berhasil di-generate!");
    } catch (error: any) {
      console.error("Gagal generate jadwal:", error);
      toast.error(
        error.response?.data?.message || "Terjadi kesalahan saat generate jadwal."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className="max-w-4xl mx-auto py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-primary/10 rounded-xl text-primary">
          <CalendarDays className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Penjadwalan Otomatis</h1>
          <p className="text-muted-foreground mt-1">
            Buat jadwal kelas secara otomatis berdasarkan SKS dan ketersediaan ruangan.
          </p>
        </div>
      </div>

      <Card className="border-2 shadow-sm">
        <CardHeader className="bg-muted/30 border-b">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Generator Jadwal
          </CardTitle>
          <CardDescription>
            Pilih Tahun Ajaran aktif untuk membuat jadwal pada kelas-kelas yang
            belum memiliki jadwal.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-3">
            <Label className="text-base">Tahun Ajaran</Label>
            {isLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Loader2 className="w-4 h-4 animate-spin" /> Memuat tahun ajaran...
              </div>
            ) : (
              <Select
                value={selectedYearId}
                onValueChange={setSelectedYearId}
              >
                <SelectTrigger className="w-full md:w-[400px]">
                  <SelectValue placeholder="Pilih Tahun Ajaran..." />
                </SelectTrigger>
                <SelectContent>
                  {academicYears.map((year) => (
                    <SelectItem key={year.id.toString()} value={year.id.toString()}>
                      {year.year} - Semester {year.semester}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-100 dark:border-blue-900/50">
            <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
              Informasi Algoritma Penjadwalan:
            </h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-blue-700/80 dark:text-blue-400/80">
              <li>1 SKS dihitung sama dengan 50 menit durasi kelas.</li>
              <li>Kelas yang sudah memiliki jadwal akan <strong>dilewati (skip)</strong>.</li>
              <li>Sistem akan secara otomatis menghindari bentrok ruangan dan jadwal mengajar Dosen.</li>
              <li>Penjadwalan dilakukan dari hari Senin - Jumat, antara pukul 08:00 - 17:00.</li>
            </ul>
          </div>

          <Button
            size="lg"
            onClick={handleGenerate}
            disabled={isGenerating || isLoading || !selectedYearId}
            className="w-full md:w-auto"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Mencari Jadwal...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Mulai Generate Jadwal
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
