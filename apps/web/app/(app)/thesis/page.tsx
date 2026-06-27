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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { Loader2, Plus, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Thesis {
  id: bigint;
  title: string;
  abstract: string;
  status: string;
  supervisors: any[];
  counselingLogs: any[];
  defense: any;
}

export default function StudentThesisPage() {
  const { user } = useAuthStore();
  const [thesis, setThesis] = useState<Thesis | null>(null);
  const [lecturers, setLecturers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Proposal State
  const [title, setTitle] = useState("");
  const [abstract, setAbstract] = useState("");
  const [supervisor1, setSupervisor1] = useState("");
  const [supervisor2, setSupervisor2] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Log State
  const [logNotes, setLogNotes] = useState("");
  const [logLecturer, setLogLecturer] = useState("");

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [thesisRes, lecturersRes] = await Promise.all([
        api.get('/theses/my-thesis').catch(() => ({ data: null })),
        api.get('/lecturers')
      ]);
      setThesis(thesisRes.data || null);
      setLecturers(lecturersRes.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePropose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supervisor1) {
      toast.error("Harap pilih Pembimbing 1");
      return;
    }
    
    const supervisorIds = [Number(supervisor1)];
    if (supervisor2) supervisorIds.push(Number(supervisor2));

    try {
      setIsSubmitting(true);
      await api.post('/theses', {
        title,
        abstract,
        proposedSupervisorIds: supervisorIds
      });
      toast.success("Pengajuan berhasil disubmit");
      fetchData();
    } catch (error) {
      toast.error("Gagal mengajukan judul");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!thesis || !logLecturer) return;
    
    try {
      setIsSubmitting(true);
      await api.post('/counseling-logs', {
        thesisId: Number(thesis.id),
        lecturerId: Number(logLecturer),
        date: new Date().toISOString(),
        notes: logNotes
      });
      toast.success("Log bimbingan berhasil ditambah");
      setLogNotes("");
      setLogLecturer("");
      fetchData();
    } catch (error) {
      toast.error("Gagal menambah log bimbingan");
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
        <h1 className="text-3xl font-bold mb-6">Tugas Akhir (Skripsi)</h1>
        
        {!thesis ? (
          <Card>
            <CardHeader>
              <CardTitle>Pengajuan Judul Skripsi</CardTitle>
              <CardDescription>Ajukan judul dan pilih calon dosen pembimbing</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePropose} className="space-y-4">
                <div className="space-y-2">
                  <Label>Judul Tugas Akhir</Label>
                  <Input required value={title} onChange={e => setTitle(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Abstrak / Deskripsi Singkat</Label>
                  <Textarea required value={abstract} onChange={e => setAbstract(e.target.value)} rows={4} />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Dosen Pembimbing 1</Label>
                    <Select value={supervisor1} onValueChange={setSupervisor1}>
                      <SelectTrigger><SelectValue placeholder="Pilih Dosen" /></SelectTrigger>
                      <SelectContent>
                        {lecturers.map(l => (
                          <SelectItem key={l.id.toString()} value={l.id.toString()}>{l.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Dosen Pembimbing 2 (Opsional)</Label>
                    <Select value={supervisor2} onValueChange={setSupervisor2}>
                      <SelectTrigger><SelectValue placeholder="Pilih Dosen" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Tidak Ada</SelectItem>
                        {lecturers.map(l => (
                          <SelectItem key={l.id.toString()} value={l.id.toString()}>{l.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="submit" disabled={isSubmitting}>Submit Pengajuan</Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle>{thesis.title}</CardTitle>
                  <CardDescription>Status Tugas Akhir Anda saat ini</CardDescription>
                </div>
                <Badge variant={thesis.status === 'COMPLETED' ? 'default' : thesis.status === 'ACTIVE' ? 'secondary' : 'outline'}>
                  {thesis.status}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <span className="font-semibold text-sm text-muted-foreground block">Abstrak</span>
                    <p className="text-sm mt-1">{thesis.abstract}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-sm text-muted-foreground block mb-2">Dosen Pembimbing</span>
                    {thesis.supervisors?.length > 0 ? (
                      <ul className="list-disc pl-5 space-y-1">
                        {thesis.supervisors.map(s => (
                          <li key={s.id.toString()} className="text-sm">
                            {s.lecturer?.name} - <Badge variant="outline" className="text-[10px] h-4">{s.role}</Badge>
                            {s.status === 'PENDING' && <span className="ml-2 text-xs text-yellow-600">(Menunggu Persetujuan)</span>}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm italic">Belum ada pembimbing yang ditetapkan.</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {thesis.defense && (
              <Card className="border-primary/50 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5"/> Jadwal Sidang</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{new Date(thesis.defense.scheduledAt).toLocaleString('id-ID')}</p>
                      <p className="text-sm">Ruangan: {thesis.defense.room}</p>
                    </div>
                    <div className="text-right">
                      <Badge className={thesis.defense.status === 'PASSED' ? 'bg-green-500' : 'bg-yellow-500'}>
                        {thesis.defense.status}
                      </Badge>
                      {thesis.defense.score && <p className="font-bold text-xl mt-1">{thesis.defense.score}</p>}
                    </div>
                  </div>
                  {thesis.defense.examiners?.length > 0 && (
                    <div className="mt-3 text-sm">
                      <span className="font-semibold block mb-1">Penguji:</span>
                      <ul className="list-disc pl-5">
                        {thesis.defense.examiners.map((ex: any) => (
                          <li key={ex.id.toString()}>{ex.lecturer?.name} ({ex.role})</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Log Bimbingan</CardTitle>
                  <CardDescription>Catatan sesi bimbingan bersama dosen</CardDescription>
                </div>
                {thesis.status === 'ACTIVE' && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm"><Plus className="h-4 w-4 mr-2" /> Tambah Log</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Tambah Log Bimbingan</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleAddLog} className="space-y-4">
                        <div className="space-y-2">
                          <Label>Pilih Pembimbing</Label>
                          <Select value={logLecturer} onValueChange={setLogLecturer}>
                            <SelectTrigger><SelectValue placeholder="Pilih Dosen Pembimbing" /></SelectTrigger>
                            <SelectContent>
                              {thesis.supervisors?.filter(s => s.status === 'APPROVED').map(s => (
                                <SelectItem key={s.id.toString()} value={s.lecturerId.toString()}>{s.lecturer?.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Catatan Kemajuan / Hasil Diskusi</Label>
                          <Textarea required value={logNotes} onChange={e => setLogNotes(e.target.value)} rows={5} />
                        </div>
                        <Button type="submit" disabled={isSubmitting}>Simpan Log</Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {thesis.counselingLogs?.length === 0 ? (
                    <p className="text-center text-muted-foreground py-6">Belum ada log bimbingan</p>
                  ) : (
                    thesis.counselingLogs?.map(log => (
                      <div key={log.id.toString()} className="border p-4 rounded-lg flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-sm">{new Date(log.date).toLocaleDateString('id-ID')}</span>
                            <Badge variant="outline" className="text-[10px]">{log.lecturer?.name}</Badge>
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{log.notes}</p>
                        </div>
                        <Badge variant={log.status === 'APPROVED' ? 'default' : log.status === 'REJECTED' ? 'destructive' : 'secondary'}>
                          {log.status}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </ClientAuthGuard>
  );
}
