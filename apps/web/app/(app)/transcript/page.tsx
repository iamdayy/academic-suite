"use client";

import ClientAuthGuard from "@/components/ClientAuthGuard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import api from "@/lib/api";
import { Loader2, Printer } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useReactToPrint } from "react-to-print";
import { QRCodeSVG } from "qrcode.react";

export default function TranscriptPage() {
  const [transcriptData, setTranscriptData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const printRef = useRef<HTMLDivElement>(null);

  const fetchTranscript = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/reports/transcript');
      setTranscriptData(res.data);
    } catch (error: any) {
      toast.error("Gagal memuat transkrip nilai");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTranscript();
  }, []);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `TRANSKRIP-${transcriptData?.student?.nim}`,
  });

  return (
    <ClientAuthGuard>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Transkrip Nilai</h1>
            <p className="text-muted-foreground">Lihat dan cetak transkrip nilai akademik seluruh semester.</p>
          </div>

          <Button onClick={() => handlePrint()} disabled={!transcriptData || isLoading}>
            <Printer className="mr-2 h-4 w-4" /> Cetak Transkrip
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>
        ) : !transcriptData || transcriptData.details.length === 0 ? (
          <Card>
            <CardContent className="py-20 text-center text-muted-foreground">
              Belum ada nilai yang disetujui untuk dicetak pada transkrip.
            </CardContent>
          </Card>
        ) : (
          <div className="bg-white text-black p-8 rounded-lg shadow-sm overflow-x-auto print-container">
            {/* The Print Layout */}
            <div ref={printRef} className="min-w-[800px] p-8 max-w-4xl mx-auto">
              
              {/* Header */}
              <div className="text-center border-b-2 border-black pb-4 mb-6">
                <h1 className="text-2xl font-bold uppercase">UNIVERSITAS NUSANTARA</h1>
                <h2 className="text-lg font-semibold uppercase">Fakultas {transcriptData.student.studyProgram?.major?.name || "Placeholder Fakultas"}</h2>
                <p className="text-sm">Jl. Pendidikan No. 123, Kota Pelajar, Kode Pos 12345</p>
                <p className="text-sm">Telp: (021) 1234567 | Web: www.univ-nusantara.ac.id</p>
              </div>

              <h3 className="text-xl font-bold text-center underline mb-6">TRANSKRIP NILAI AKADEMIK</h3>

              {/* Student Info */}
              <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                <div>
                  <table className="w-full">
                    <tbody>
                      <tr><td className="w-32 py-1 font-semibold">Nama Lengkap</td><td>: {transcriptData.student.name}</td></tr>
                      <tr><td className="w-32 py-1 font-semibold">NIM</td><td>: {transcriptData.student.nim}</td></tr>
                    </tbody>
                  </table>
                </div>
                <div>
                  <table className="w-full">
                    <tbody>
                      <tr><td className="w-32 py-1 font-semibold">Program Studi</td><td>: {transcriptData.student.studyProgram?.name}</td></tr>
                      <tr><td className="w-32 py-1 font-semibold">Tanggal Cetak</td><td>: {new Date().toLocaleDateString('id-ID')}</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Grades Table */}
              <table className="w-full border-collapse border border-black text-sm mb-6">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-black py-2 px-2 text-center w-12">No</th>
                    <th className="border border-black py-2 px-2 text-left w-32">Kode MK</th>
                    <th className="border border-black py-2 px-2 text-left">Mata Kuliah</th>
                    <th className="border border-black py-2 px-2 text-center">SKS (K)</th>
                    <th className="border border-black py-2 px-2 text-center">Nilai (N)</th>
                    <th className="border border-black py-2 px-2 text-center">Bobot (B)</th>
                    <th className="border border-black py-2 px-2 text-center">Mutu (KxB)</th>
                  </tr>
                </thead>
                <tbody>
                  {transcriptData.details.map((detail: any, index: number) => (
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
                    <td colSpan={3} className="border border-black py-2 px-2 text-right">TOTAL KUMULATIF</td>
                    <td className="border border-black py-2 px-2 text-center">{transcriptData.summary.totalSks}</td>
                    <td colSpan={2} className="border border-black py-2 px-2 text-center bg-gray-50"></td>
                    <td className="border border-black py-2 px-2 text-center">{transcriptData.summary.ipk * transcriptData.summary.totalSks}</td>
                  </tr>
                </tbody>
              </table>

              {/* Summary & Signature */}
              <div className="flex justify-between items-start mt-8 text-sm">
                <div className="border border-black p-4 w-72">
                  <p className="font-semibold mb-2 text-center border-b border-black pb-2">Indeks Prestasi Kumulatif (IPK)</p>
                  <p className="text-4xl font-bold text-center mt-4">{transcriptData.summary.ipk}</p>
                </div>

                <div className="text-center w-72">
                  <p className="mb-2">Kota Pelajar, {new Date().toLocaleDateString('id-ID')}</p>
                  <p className="font-semibold mb-2">Dekan Fakultas</p>
                  <div className="flex justify-center my-4">
                    <QRCodeSVG value={`https://univ-nusantara.ac.id/verify/${transcriptData.signatureToken}`} size={90} />
                  </div>
                  <p className="font-semibold underline">Prof. Dr. Ir. Haryanto, M.Sc.</p>
                  <p>NIP. 19700101 199501 1 001</p>
                </div>
              </div>
              
              <div className="mt-12 text-xs text-gray-500 text-center italic">
                * Transkrip ini sah dan ditandatangani secara elektronik. Scan QR Code untuk verifikasi keaslian.
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
