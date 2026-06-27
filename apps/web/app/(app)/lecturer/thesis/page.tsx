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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import api from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { Loader2, Check, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function LecturerThesisPage() {
  const { user } = useAuthStore();
  const [theses, setTheses] = useState<any[]>([]);
  const [counselingLogs, setCounselingLogs] = useState<any[]>([]);
  const [defenses, setDefenses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [thesesRes, logsRes, defensesRes] = await Promise.all([
        api.get('/theses'),
        api.get('/counseling-logs'),
        api.get('/thesis-defenses')
      ]);

      if (user?.lecturer?.id) {
        const myLecturerId = user.lecturer.id;
        
        // Filter theses where this lecturer is a supervisor
        const myTheses = thesesRes.data.filter((t: any) => 
          t.supervisors.some((s: any) => s.lecturerId === myLecturerId)
        );
        setTheses(myTheses);

        // Filter logs where this lecturer is the supervisor
        const myLogs = logsRes.data.filter((l: any) => l.lecturerId === myLecturerId);
        setCounselingLogs(myLogs);

        // Filter defenses where this lecturer is an examiner
        const myDefenses = defensesRes.data.filter((d: any) => 
          d.examiners.some((e: any) => e.lecturerId === myLecturerId)
        );
        setDefenses(myDefenses);
      }
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleUpdateLogStatus = async (logId: number, status: string) => {
    try {
      await api.patch(`/counseling-logs/${logId}`, { status });
      toast.success("Status log berhasil diperbarui");
      fetchData();
    } catch (error) {
      toast.error("Gagal memperbarui status log");
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
        <h1 className="text-3xl font-bold mb-6">Bimbingan & Tugas Akhir</h1>
        
        <Tabs defaultValue="supervision" className="space-y-4">
          <TabsList>
            <TabsTrigger value="supervision">Mahasiswa Bimbingan</TabsTrigger>
            <TabsTrigger value="logs">Log Bimbingan</TabsTrigger>
            <TabsTrigger value="exams">Jadwal Sidang / Ujian</TabsTrigger>
          </TabsList>

          <TabsContent value="supervision">
            <Card>
              <CardHeader>
                <CardTitle>Daftar Mahasiswa Bimbingan</CardTitle>
                <CardDescription>Mahasiswa yang Anda bimbing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {theses.length === 0 ? (
                    <p className="text-center py-4 text-muted-foreground">Tidak ada mahasiswa bimbingan.</p>
                  ) : (
                    theses.map(t => {
                      const myRole = t.supervisors.find((s: any) => s.lecturerId === user?.lecturer?.id);
                      return (
                        <div key={t.id.toString()} className="border p-4 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-semibold text-lg">{t.title}</h3>
                              <p className="text-sm text-muted-foreground">{t.student?.user?.name} - {t.student?.nim}</p>
                            </div>
                            <div className="text-right">
                              <Badge className="mb-1 block">{t.status}</Badge>
                              <Badge variant="outline" className="text-[10px]">{myRole?.role} ({myRole?.status})</Badge>
                            </div>
                          </div>
                          <p className="text-sm line-clamp-2">{t.abstract}</p>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <CardTitle>Log Bimbingan (Pending)</CardTitle>
                <CardDescription>Persetujuan log bimbingan dari mahasiswa</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {counselingLogs.filter(l => l.status === 'PENDING').length === 0 ? (
                    <p className="text-center py-4 text-muted-foreground">Tidak ada log bimbingan yang menunggu persetujuan.</p>
                  ) : (
                    counselingLogs.filter(l => l.status === 'PENDING').map(log => (
                      <div key={log.id.toString()} className="border p-4 rounded-lg flex justify-between items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{log.thesis?.student?.user?.name}</span>
                            <span className="text-sm text-muted-foreground">{new Date(log.date).toLocaleDateString('id-ID')}</span>
                          </div>
                          <p className="text-sm">{log.notes}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="text-green-600 border-green-600" onClick={() => handleUpdateLogStatus(log.id, 'APPROVED')}>
                            <Check className="h-4 w-4 mr-1" /> Setujui
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600 border-red-600" onClick={() => handleUpdateLogStatus(log.id, 'REJECTED')}>
                            <X className="h-4 w-4 mr-1" /> Tolak
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="exams">
            <Card>
              <CardHeader>
                <CardTitle>Jadwal Ujian / Sidang</CardTitle>
                <CardDescription>Jadwal di mana Anda bertindak sebagai penguji</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {defenses.length === 0 ? (
                    <p className="text-center py-4 text-muted-foreground">Tidak ada jadwal sidang.</p>
                  ) : (
                    defenses.map(d => {
                      const myRole = d.examiners.find((e: any) => e.lecturerId === user?.lecturer?.id);
                      return (
                        <div key={d.id.toString()} className="border p-4 rounded-lg flex justify-between items-center">
                          <div>
                            <h3 className="font-semibold">{d.thesis?.student?.user?.name} - {d.thesis?.title}</h3>
                            <div className="text-sm text-muted-foreground mt-1">
                              <span>{new Date(d.scheduledAt).toLocaleString('id-ID')}</span> • <span>Ruangan: {d.room}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className="mb-1">{d.status}</Badge>
                            <p className="text-xs font-semibold">{myRole?.role}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </ClientAuthGuard>
  );
}
