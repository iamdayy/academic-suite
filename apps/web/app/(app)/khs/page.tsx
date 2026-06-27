"use client";

import ClientAuthGuard from "@/components/ClientAuthGuard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from "@/lib/api";
import { Loader2, Printer } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useReactToPrint } from "react-to-print";
import { QRCodeSVG } from "qrcode.react";

export default function KHSPage() {
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [selectedYearId, setSelectedYearId] = useState<string>("");
  const [khsData, setKhsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const printRef = useRef<HTMLDivElement>(null);

  const fetchAcademicYears = async () => {
    try {
      const res = await api.get('/academic-years');
      setAcademicYears(res.data);
      if (res.data.length > 0) {
        // Default select active or first
        const active = res.data.find((ay: any) => ay.isActive);
        setSelectedYearId(active ? active.id.toString() : res.data[0].id.toString());
      }
    } catch (error) {
      toast.error("Gagal memuat tahun akademik");
    }
  };

  const fetchKHS = async (yearId: string) => {
    try {
      setIsLoading(true);
      setKhsData(null);
      const res = await api.get(`/reports/khs/${yearId}`);
      setKhsData(res.data);
    } catch (error: any) {
      if (error.response?.status !== 404) {
        toast.error("Gagal memuat KHS");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAcademicYears();
  }, []);

  useEffect(() => {
    if (selectedYearId) {
      fetchKHS(selectedYearId);
    }
  }, [selectedYearId]);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `KHS-${khsData?.student?.nim}-${khsData?.academicYear?.year}`,
  });

  return (
    <ClientAuthGuard>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Kartu Hasil Studi (KHS)</h1>
            <p className="text-muted-foreground">Lihat dan cetak kartu hasil studi per semester.</p>
          </div>

          <div className="flex items-center gap-2">
            <Select value={selectedYearId} onValueChange={setSelectedYearId}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Pilih Semester" />
              </SelectTrigger>
              <SelectContent>
                {academicYears.map(ay => (
                  <SelectItem key={ay.id.toString()} value={ay.id.toString()}>
                    {ay.year} - {ay.semester}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={() => handlePrint()} disabled={!khsData || isLoading}>
              <Printer className="mr-2 h-4 w-4" /> Cetak
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>
        ) : !khsData ? (
          <Card>
            <CardContent className="py-20 text-center text-muted-foreground">
              Tidak ada data KHS yang disetujui untuk semester ini.
            </CardContent>
          </Card>
        ) : (
          <div className="bg-white text-black p-8 rounded-lg shadow-sm overflow-x-auto print-container">
            {/* The Print Layout */}
            <div ref={printRef} className="min-w-[800px] p-8 max-w-4xl mx-auto">
              
              {/* Header */}
              <div className="text-center border-b-2 border-black pb-4 mb-6">
                <h1 className="text-2xl font-bold uppercase">UNIVERSITAS NUSANTARA</h1>
                <h2 className="text-lg font-semibold uppercase">Fakultas {khsData.student.studyProgram?.major?.name || "Placeholder Fakultas"}</h2>
                <p className="text-sm">Jl. Pendidikan No. 123, Kota Pelajar, Kode Pos 12345</p>
                <p className="text-sm">Telp: (021) 1234567 | Web: www.univ-nusantara.ac.id</p>
              </div>

              <h3 className="text-xl font-bold text-center underline mb-6">KARTU HASIL STUDI (KHS)</h3>

              {/* Student Info */}
              <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                <div>
                  <table className="w-full">
                    <tbody>
                      <tr><td className="w-32 py-1 font-semibold">Nama Mahasiswa</td><td>: {khsData.student.name}</td></tr>
                      <tr><td className="w-32 py-1 font-semibold">NIM</td><td>: {khsData.student.nim}</td></tr>
                      <tr><td className="w-32 py-1 font-semibold">Program Studi</td><td>: {khsData.student.studyProgram?.name}</td></tr>
                    </tbody>
                  </table>
                </div>
                <div>
                  <table className="w-full">
                    <tbody>
                      <tr><td className="w-32 py-1 font-semibold">Tahun Akademik</td><td>: {khsData.academicYear.year}</td></tr>
                      <tr><td className="w-32 py-1 font-semibold">Semester</td><td>: {khsData.academicYear.semester}</td></tr>
                      <tr><td className="w-32 py-1 font-semibold">Tingkat</td><td>: Semester {khsData.semester}</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Grades Table */}
              <table className="w-full border-collapse border border-black text-sm mb-6">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-black py-2 px-2 text-center w-12">No</th>
                    <th className="border border-black py-2 px-2 text-left">Kode MK</th>
                    <th className="border border-black py-2 px-2 text-left">Mata Kuliah</th>
                    <th className="border border-black py-2 px-2 text-center">SKS (K)</th>
                    <th className="border border-black py-2 px-2 text-center">Nilai (N)</th>
                    <th className="border border-black py-2 px-2 text-center">Bobot (B)</th>
                    <th className="border border-black py-2 px-2 text-center">Mutu (KxB)</th>
                  </tr>
                </thead>
                <tbody>
                  {khsData.details.map((detail: any, index: number) => (
                    <tr key={index}>
                      <td className="border border-black py-1 px-2 text-center">{index + 1}</td>
                      <td className="border border-black py-1 px-2">{detail.courseCode}</td>
                      <td className="border border-black py-1 px-2">{detail.courseName}</td>
                      <td className="border border-black py-1 px-2 text-center">{detail.sks}</td>
                      <td className="border border-black py-1 px-2 text-center font-semibold">{detail.grade}</td>
                      <td className="border border-black py-1 px-2 text-center">{detail.gradeValue}</td>
                      <td className="border border-black py-1 px-2 text-center">{detail.score}</td>
                    </tr>
                  ))}
                  <tr className="font-bold">
                    <td colSpan={3} className="border border-black py-2 px-2 text-right">TOTAL</td>
                    <td className="border border-black py-2 px-2 text-center">{khsData.summary.totalSks}</td>
                    <td colSpan={2} className="border border-black py-2 px-2 text-center bg-gray-50"></td>
                    <td className="border border-black py-2 px-2 text-center">{khsData.summary.ips * khsData.summary.totalSks}</td>
                  </tr>
                </tbody>
              </table>

              {/* Summary & Signature */}
              <div className="flex justify-between items-start mt-8 text-sm">
                <div className="border border-black p-4 w-64">
                  <p className="font-semibold mb-2 text-center border-b border-black pb-2">Indeks Prestasi Semester (IPS)</p>
                  <p className="text-3xl font-bold text-center mt-4">{khsData.summary.ips}</p>
                </div>

                <div className="text-center w-64">
                  <p className="mb-2">Kota Pelajar, {new Date().toLocaleDateString('id-ID')}</p>
                  <p className="font-semibold mb-2">Wakil Dekan Bidang Akademik</p>
                  <div className="flex justify-center my-4">
                    <QRCodeSVG value={`https://univ-nusantara.ac.id/verify/${khsData.signatureToken}`} size={80} />
                  </div>
                  <p className="font-semibold underline">Dr. Budi Santoso, M.Kom.</p>
                  <p>NIP. 19800101 200501 1 001</p>
                </div>
              </div>
              
              <div className="mt-12 text-xs text-gray-500 text-center italic">
                * Dokumen ini sah dan ditandatangani secara elektronik. Scan QR Code untuk verifikasi.
              </div>
            </div>
          </div>
        )}
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { -webkit-print-color-adjust: exact; }
          @page { margin: 15mm; }
        }
      `}} />
    </ClientAuthGuard>
  );
}
