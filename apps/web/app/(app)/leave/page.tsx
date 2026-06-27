"use client";

import ClientAuthGuard from "@/components/ClientAuthGuard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function StudentLeavePage() {
  const { user } = useAuthStore();
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [academicYearId, setAcademicYearId] = useState("");
  const [reason, setReason] = useState("");
  const [documentUrl, setDocumentUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [requestsRes, yearsRes] = await Promise.all([
        api.get('/leave-requests/my'),
        api.get('/academic-years')
      ]);
      setLeaveRequests(requestsRes.data || []);
      setAcademicYears(yearsRes.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!academicYearId || !reason) {
      toast.error("Harap isi semua field wajib");
      return;
    }
    
    try {
      setIsSubmitting(true);
      await api.post('/leave-requests', {
        academicYearId: Number(academicYearId),
        reason,
        documentUrl
      });
      toast.success("Pengajuan cuti berhasil disubmit");
      setReason("");
      setDocumentUrl("");
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal mengajukan cuti");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center mt-10">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <ClientAuthGuard>
      <div>
        <h1 className="text-3xl font-bold mb-6">Cuti Akademik</h1>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Pengajuan Cuti</CardTitle>
                <CardDescription>Ajukan cuti untuk semester tertentu</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Tahun Ajaran & Semester</Label>
                    <Select value={academicYearId} onValueChange={setAcademicYearId}>
                      <SelectTrigger><SelectValue placeholder="Pilih Semester" /></SelectTrigger>
                      <SelectContent>
                        {academicYears.map(y => (
                          <SelectItem key={y.id.toString()} value={y.id.toString()}>
                            {y.year} - {y.semester}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Alasan Cuti</Label>
                    <Textarea required value={reason} onChange={e => setReason(e.target.value)} rows={4} placeholder="Jelaskan alasan pengajuan cuti secara rinci" />
                  </div>
                  <div className="space-y-2">
                    <Label>URL Dokumen Pendukung (Opsional)</Label>
                    <Input value={documentUrl} onChange={e => setDocumentUrl(e.target.value)} placeholder="Link Google Drive, dll." />
                  </div>
                  <Button type="submit" disabled={isSubmitting} className="w-full">Submit Pengajuan</Button>
                </form>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Riwayat Pengajuan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leaveRequests.length === 0 ? (
                    <p className="text-center text-muted-foreground py-6">Belum ada riwayat pengajuan cuti.</p>
                  ) : (
                    leaveRequests.map(req => (
                      <div key={req.id.toString()} className="border p-4 rounded-lg flex flex-col justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{req.academicYear?.year} - {req.academicYear?.semester}</h4>
                            <Badge variant={req.status === 'APPROVED' ? 'default' : req.status === 'REJECTED' ? 'destructive' : 'secondary'}>
                              {req.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">{req.reason}</p>
                          {req.documentUrl && (
                            <a href={req.documentUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-500 hover:underline mt-2 inline-block">
                              Lihat Dokumen Pendukung
                            </a>
                          )}
                          {req.adminNotes && (
                            <div className="mt-3 bg-muted p-2 rounded text-sm">
                              <span className="font-semibold block mb-1">Catatan Admin:</span>
                              {req.adminNotes}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ClientAuthGuard>
  );
}
