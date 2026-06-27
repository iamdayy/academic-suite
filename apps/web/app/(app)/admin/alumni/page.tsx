"use client";

import ClientAuthGuard from "@/components/ClientAuthGuard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function AdminAlumniPage() {
  const [yudisiumList, setYudisiumList] = useState<any[]>([]);
  const [wisudaEvents, setWisudaEvents] = useState<any[]>([]);
  const [tracerStudies, setTracerStudies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New Wisuda Event state
  const [batchName, setBatchName] = useState("");
  const [eventDate, setEventDate] = useState("");

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [yudRes, wisRes, tracerRes] = await Promise.all([
        api.get('/alumni/yudisium').catch(() => ({ data: [] })),
        api.get('/alumni/wisuda/events').catch(() => ({ data: [] })),
        api.get('/alumni/tracer').catch(() => ({ data: [] }))
      ]);

      setYudisiumList(yudRes.data);
      setWisudaEvents(wisRes.data);
      setTracerStudies(tracerRes.data);
    } catch (error) {
      toast.error("Gagal memuat data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateYudisium = async (id: number, status: string) => {
    try {
      await api.patch(`/alumni/yudisium/${id}`, { status });
      toast.success("Status Yudisium diperbarui");
      fetchData();
    } catch (error) {
      toast.error("Gagal memperbarui status");
    }
  };

  const handleCreateWisudaEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/alumni/wisuda/events', { batchName, eventDate });
      toast.success("Event Wisuda berhasil dibuat");
      setBatchName("");
      setEventDate("");
      fetchData();
    } catch (error) {
      toast.error("Gagal membuat event wisuda");
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
          <h1 className="text-3xl font-bold">Kelulusan & Alumni (Admin)</h1>
          <p className="text-muted-foreground">Kelola pendaftaran Yudisium, acara Wisuda, dan pantau hasil Tracer Study.</p>
        </div>

        <Tabs defaultValue="yudisium" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="yudisium">Yudisium</TabsTrigger>
            <TabsTrigger value="wisuda">Wisuda</TabsTrigger>
            <TabsTrigger value="tracer">Tracer Study</TabsTrigger>
          </TabsList>

          <TabsContent value="yudisium">
            <Card>
              <CardHeader>
                <CardTitle>Pendaftar Yudisium</CardTitle>
                <CardDescription>Persetujuan yudisium bagi mahasiswa yang memenuhi syarat SKS dan Nilai.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>NIM</TableHead>
                        <TableHead>Nama Mahasiswa</TableHead>
                        <TableHead>IPK</TableHead>
                        <TableHead>Total SKS</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {yudisiumList.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground py-6">Tidak ada pendaftaran yudisium</TableCell>
                        </TableRow>
                      ) : yudisiumList.map((y) => (
                        <TableRow key={y.id}>
                          <TableCell>{y.student.nim}</TableCell>
                          <TableCell>{y.student.name}</TableCell>
                          <TableCell>{y.ipk}</TableCell>
                          <TableCell>{y.totalCredits}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              y.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                              y.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {y.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            {y.status === 'PENDING' && (
                              <div className="flex justify-end gap-2">
                                <Button size="sm" variant="outline" className="text-green-600 border-green-600 hover:bg-green-50" onClick={() => handleUpdateYudisium(y.id, 'APPROVED')}>
                                  <CheckCircle className="h-4 w-4 mr-1" /> Setujui
                                </Button>
                                <Button size="sm" variant="outline" className="text-red-600 border-red-600 hover:bg-red-50" onClick={() => handleUpdateYudisium(y.id, 'REJECTED')}>
                                  <XCircle className="h-4 w-4 mr-1" /> Tolak
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wisuda">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Buat Event Wisuda</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateWisudaEvent} className="flex gap-4 items-end">
                  <div className="space-y-2 flex-1">
                    <label className="text-sm font-medium">Nama Gelombang (Contoh: Wisuda Angkatan 45)</label>
                    <Input value={batchName} onChange={e => setBatchName(e.target.value)} required />
                  </div>
                  <div className="space-y-2 flex-1">
                    <label className="text-sm font-medium">Tanggal Pelaksanaan</label>
                    <Input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} required />
                  </div>
                  <Button type="submit">Buat Event</Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Daftar Event Wisuda</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama Gelombang</TableHead>
                        <TableHead>Tanggal Pelaksanaan</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {wisudaEvents.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground py-6">Belum ada event wisuda</TableCell>
                        </TableRow>
                      ) : wisudaEvents.map((w) => (
                        <TableRow key={w.id}>
                          <TableCell className="font-medium">{w.batchName}</TableCell>
                          <TableCell>{new Date(w.eventDate).toLocaleDateString('id-ID')}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${w.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                              {w.isActive ? 'Aktif' : 'Selesai'}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="ghost">Lihat Pendaftar</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tracer">
            <Card>
              <CardHeader>
                <CardTitle>Hasil Tracer Study</CardTitle>
                <CardDescription>Pemantauan karir dan masukan dari alumni.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama Alumni</TableHead>
                        <TableHead>Program Studi</TableHead>
                        <TableHead>Status Bekerja</TableHead>
                        <TableHead>Perusahaan</TableHead>
                        <TableHead>Gaji</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tracerStudies.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-6">Belum ada data tracer study</TableCell>
                        </TableRow>
                      ) : tracerStudies.map((t) => (
                        <TableRow key={t.id}>
                          <TableCell className="font-medium">{t.student.name}</TableCell>
                          <TableCell>{t.student.studyProgram?.name}</TableCell>
                          <TableCell>
                            {t.employed ? (
                              <span className="text-green-600 font-medium">Bekerja/Wirausaha</span>
                            ) : (
                              <span className="text-red-600">Belum Bekerja</span>
                            )}
                          </TableCell>
                          <TableCell>{t.companyName || '-'}</TableCell>
                          <TableCell>{t.salaryRange || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ClientAuthGuard>
  );
}
