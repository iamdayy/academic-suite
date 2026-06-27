"use client";

import ClientAuthGuard from "@/components/ClientAuthGuard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from "@/lib/api";
import { Loader2, GraduationCap, FileCheck2, Briefcase } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function GraduationPage() {
  const [yudisium, setYudisium] = useState<any>(null);
  const [wisuda, setWisuda] = useState<any>(null);
  const [tracer, setTracer] = useState<any>(null);
  const [wisudaEvents, setWisudaEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Tracer Study Form
  const [employed, setEmployed] = useState<string>("false");
  const [companyName, setCompanyName] = useState("");
  const [salaryRange, setSalaryRange] = useState("");
  const [feedback, setFeedback] = useState("");

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [yudRes, wisRes, tracerRes, eventsRes] = await Promise.all([
        api.get('/alumni/yudisium/me').catch(() => ({ data: null })),
        api.get('/alumni/wisuda/me').catch(() => ({ data: null })),
        api.get('/alumni/tracer/me').catch(() => ({ data: null })),
        api.get('/alumni/wisuda/events').catch(() => ({ data: [] }))
      ]);

      setYudisium(yudRes.data);
      setWisuda(wisRes.data);
      setWisudaEvents(eventsRes.data);
      
      if (tracerRes.data) {
        setTracer(tracerRes.data);
        setEmployed(tracerRes.data.employed ? "true" : "false");
        setCompanyName(tracerRes.data.companyName || "");
        setSalaryRange(tracerRes.data.salaryRange || "");
        setFeedback(tracerRes.data.feedback || "");
      }
    } catch (error) {
      toast.error("Gagal memuat data kelulusan");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApplyYudisium = async () => {
    try {
      await api.post('/alumni/yudisium');
      toast.success("Berhasil mendaftar Yudisium");
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal mendaftar Yudisium");
    }
  };

  const handleRegisterWisuda = async (eventId: number) => {
    try {
      await api.post('/alumni/wisuda/register', { eventId });
      toast.success("Berhasil mendaftar Wisuda");
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal mendaftar Wisuda");
    }
  };

  const handleTracerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/alumni/tracer', {
        employed: employed === "true",
        companyName,
        salaryRange,
        feedback
      });
      toast.success("Tracer Study berhasil disimpan");
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal menyimpan Tracer Study");
    }
  };

  if (isLoading) {
    return (
      <ClientAuthGuard>
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>
      </ClientAuthGuard>
    );
  }

  return (
    <ClientAuthGuard>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Kelulusan & Alumni</h1>
          <p className="text-muted-foreground">Pendaftaran Yudisium, Wisuda, dan Tracer Study.</p>
        </div>

        <Tabs defaultValue="yudisium" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="yudisium">Yudisium</TabsTrigger>
            <TabsTrigger value="wisuda" disabled={yudisium?.status !== 'APPROVED'}>Wisuda</TabsTrigger>
            <TabsTrigger value="tracer" disabled={yudisium?.status !== 'APPROVED'}>Tracer Study</TabsTrigger>
          </TabsList>

          <TabsContent value="yudisium">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><FileCheck2 className="h-5 w-5" /> Pendaftaran Yudisium</CardTitle>
                <CardDescription>Langkah awal untuk kelulusan. Pastikan SKS Anda minimal 144.</CardDescription>
              </CardHeader>
              <CardContent>
                {yudisium ? (
                  <div className="space-y-4">
                    <div className="bg-muted p-4 rounded-md">
                      <p className="text-sm text-muted-foreground mb-1">Status Pengajuan</p>
                      <p className="text-lg font-bold">
                        {yudisium.status === 'APPROVED' ? <span className="text-green-600">Disetujui (Lulus)</span> :
                         yudisium.status === 'REJECTED' ? <span className="text-red-600">Ditolak</span> :
                         <span className="text-yellow-600">Menunggu Persetujuan</span>}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">IPK Final</p>
                        <p className="font-semibold">{yudisium.ipk}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total SKS</p>
                        <p className="font-semibold">{yudisium.totalCredits}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="mb-4 text-muted-foreground">Anda belum mendaftar Yudisium.</p>
                    <Button onClick={handleApplyYudisium}>Daftar Yudisium Sekarang</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wisuda">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><GraduationCap className="h-5 w-5" /> Pendaftaran Wisuda</CardTitle>
                <CardDescription>Pilih gelombang wisuda yang tersedia setelah Yudisium Anda disetujui.</CardDescription>
              </CardHeader>
              <CardContent>
                {wisuda ? (
                  <div className="space-y-4">
                    <div className="bg-muted p-4 rounded-md">
                      <p className="text-sm text-muted-foreground mb-1">Status Pendaftaran</p>
                      <p className="text-lg font-bold text-primary">{wisuda.status}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Acara Wisuda</p>
                      <p className="font-semibold">{wisuda.wisudaEvent.batchName}</p>
                      <p className="text-sm text-muted-foreground mt-2">Tanggal Pelaksanaan</p>
                      <p className="font-semibold">{new Date(wisuda.wisudaEvent.eventDate).toLocaleDateString('id-ID')}</p>
                    </div>
                  </div>
                ) : wisudaEvents.filter(e => e.isActive).length > 0 ? (
                  <div className="space-y-4">
                    <p>Gelombang wisuda yang tersedia:</p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {wisudaEvents.filter(e => e.isActive).map(event => (
                        <div key={event.id} className="border p-4 rounded-md flex justify-between items-center">
                          <div>
                            <p className="font-bold">{event.batchName}</p>
                            <p className="text-sm text-muted-foreground">{new Date(event.eventDate).toLocaleDateString('id-ID')}</p>
                          </div>
                          <Button size="sm" onClick={() => handleRegisterWisuda(event.id)}>Daftar</Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    Tidak ada event wisuda yang aktif saat ini.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tracer">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5" /> Tracer Study</CardTitle>
                <CardDescription>Bantu kami meningkatkan kualitas pendidikan dengan mengisi kuesioner alumni.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleTracerSubmit} className="space-y-4 max-w-xl">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status Pekerjaan</label>
                    <Select value={employed} onValueChange={setEmployed}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih status pekerjaan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Sudah Bekerja / Wirausaha</SelectItem>
                        <SelectItem value="false">Belum Bekerja / Sedang Mencari Kerja</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {employed === "true" && (
                    <>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Nama Perusahaan / Instansi / Usaha</label>
                        <Input value={companyName} onChange={e => setCompanyName(e.target.value)} required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Rentang Penghasilan (Per Bulan)</label>
                        <Select value={salaryRange} onValueChange={setSalaryRange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih rentang penghasilan" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="< 3 Juta">Kurang dari Rp 3 Juta</SelectItem>
                            <SelectItem value="3 - 5 Juta">Rp 3 Juta - Rp 5 Juta</SelectItem>
                            <SelectItem value="5 - 10 Juta">Rp 5 Juta - Rp 10 Juta</SelectItem>
                            <SelectItem value="> 10 Juta">Lebih dari Rp 10 Juta</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Masukan & Saran untuk Program Studi</label>
                    <Textarea value={feedback} onChange={e => setFeedback(e.target.value)} rows={4} placeholder="Tuliskan pengalaman atau saran Anda..." />
                  </div>

                  <Button type="submit">{tracer ? 'Perbarui Data' : 'Simpan Data'}</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ClientAuthGuard>
  );
}
