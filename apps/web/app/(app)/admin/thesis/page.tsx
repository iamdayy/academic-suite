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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from "@/lib/api";
import { Loader2, CalendarPlus, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function AdminThesisPage() {
  const [theses, setTheses] = useState<any[]>([]);
  const [lecturers, setLecturers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Defense Scheduling State
  const [selectedThesis, setSelectedThesis] = useState<any>(null);
  const [scheduledAt, setScheduledAt] = useState("");
  const [room, setRoom] = useState("");
  const [examiner1, setExaminer1] = useState("");
  const [examiner2, setExaminer2] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [thesesRes, lecturersRes] = await Promise.all([
        api.get('/theses'),
        api.get('/lecturers')
      ]);
      setTheses(thesesRes.data || []);
      setLecturers(lecturersRes.data || []);
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

  const handleApproveThesis = async (thesisId: number, status: string) => {
    try {
      await api.patch(`/theses/${thesisId}`, { status });
      toast.success("Status Tugas Akhir diperbarui");
      fetchData();
    } catch (error) {
      toast.error("Gagal memperbarui status");
    }
  };
  
  const handleApproveSupervisor = async (thesisId: number, supervisorId: number, status: string) => {
      try {
        await api.patch(`/theses/${thesisId}`, { 
            supervisorApprovals: [{ supervisorId, status }] 
        });
        toast.success("Status Pembimbing diperbarui");
        fetchData();
      } catch (error) {
        toast.error("Gagal memperbarui status");
      }
  };

  const handleScheduleDefense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedThesis || !examiner1 || !examiner2) {
      toast.error("Pilih dua penguji");
      return;
    }
    
    try {
      setIsSubmitting(true);
      await api.post('/thesis-defenses', {
        thesisId: Number(selectedThesis.id),
        scheduledAt: new Date(scheduledAt).toISOString(),
        room,
        examinerIds: [Number(examiner1), Number(examiner2)]
      });
      toast.success("Jadwal sidang berhasil dibuat");
      setIsDialogOpen(false);
      fetchData();
    } catch (error) {
      toast.error("Gagal membuat jadwal sidang");
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
        <h1 className="text-3xl font-bold mb-6">Administrasi Tugas Akhir</h1>
        
        <div className="space-y-6">
          {theses.map(thesis => (
            <Card key={thesis.id.toString()}>
              <CardHeader className="flex flex-row justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{thesis.title}</CardTitle>
                  <CardDescription>{thesis.student?.user?.name} ({thesis.student?.nim}) - {thesis.student?.studyProgram?.name}</CardDescription>
                </div>
                <div className="flex gap-2 items-center">
                  <Badge variant={thesis.status === 'COMPLETED' ? 'default' : 'secondary'}>{thesis.status}</Badge>
                  {thesis.status === 'PROPOSED' && (
                    <Button size="sm" onClick={() => handleApproveThesis(thesis.id, 'ACTIVE')}>Setujui Pengajuan</Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Pembimbing:</h4>
                    <ul className="space-y-2">
                      {thesis.supervisors?.map((s: any) => (
                        <li key={s.id.toString()} className="flex justify-between items-center bg-muted/50 p-2 rounded-md text-sm">
                          <div>
                            <span className="font-medium">{s.lecturer?.name}</span> <Badge variant="outline" className="text-[10px] ml-1">{s.role}</Badge>
                            <span className={`text-[10px] ml-2 font-bold ${s.status === 'APPROVED' ? 'text-green-600' : 'text-yellow-600'}`}>
                                ({s.status})
                            </span>
                          </div>
                          {s.status === 'PENDING' && (
                              <Button size="sm" variant="ghost" className="h-6 px-2 text-green-600" onClick={() => handleApproveSupervisor(thesis.id, s.id, 'APPROVED')}>
                                  <Check className="h-3 w-3 mr-1" /> Approve
                              </Button>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Sidang / Ujian:</h4>
                    {thesis.defense ? (
                      <div className="bg-primary/5 p-3 rounded-md border border-primary/20">
                        <div className="flex justify-between mb-1">
                          <span className="font-semibold">{new Date(thesis.defense.scheduledAt).toLocaleString('id-ID')}</span>
                          <Badge className={thesis.defense.status === 'PASSED' ? 'bg-green-500' : ''}>{thesis.defense.status}</Badge>
                        </div>
                        <p className="text-sm">Ruangan: {thesis.defense.room}</p>
                      </div>
                    ) : (
                      thesis.status === 'ACTIVE' && (
                        <Dialog open={isDialogOpen && selectedThesis?.id === thesis.id} onOpenChange={(open) => {
                          setIsDialogOpen(open);
                          if(open) setSelectedThesis(thesis);
                        }}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="w-full">
                              <CalendarPlus className="h-4 w-4 mr-2" /> Jadwalkan Sidang
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Jadwalkan Sidang - {thesis.student?.user?.name}</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleScheduleDefense} className="space-y-4">
                              <div className="space-y-2">
                                <Label>Tanggal & Waktu</Label>
                                <Input type="datetime-local" required value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} />
                              </div>
                              <div className="space-y-2">
                                <Label>Ruangan</Label>
                                <Input required value={room} onChange={e => setRoom(e.target.value)} placeholder="Misal: Ruang Sidang 1" />
                              </div>
                              <div className="space-y-2">
                                <Label>Penguji 1</Label>
                                <Select value={examiner1} onValueChange={setExaminer1}>
                                  <SelectTrigger><SelectValue placeholder="Pilih Dosen" /></SelectTrigger>
                                  <SelectContent>
                                    {lecturers.map(l => (
                                      <SelectItem key={l.id.toString()} value={l.id.toString()}>{l.name}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label>Penguji 2</Label>
                                <Select value={examiner2} onValueChange={setExaminer2}>
                                  <SelectTrigger><SelectValue placeholder="Pilih Dosen" /></SelectTrigger>
                                  <SelectContent>
                                    {lecturers.map(l => (
                                      <SelectItem key={l.id.toString()} value={l.id.toString()}>{l.name}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <Button type="submit" disabled={isSubmitting}>Simpan Jadwal</Button>
                            </form>
                          </DialogContent>
                        </Dialog>
                      )
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {theses.length === 0 && (
            <p className="text-center text-muted-foreground py-10">Belum ada pengajuan tugas akhir.</p>
          )}
        </div>
      </div>
    </ClientAuthGuard>
  );
}
