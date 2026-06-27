"use client";

import ClientAuthGuard from "@/components/ClientAuthGuard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import api from "@/lib/api";
import { Loader2, Plus, Users, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Link from "next/link";

export default function AdminEdomPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Question Form
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [qText, setQText] = useState("");
  const [qActive, setQActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Results Modal
  const [selectedClassResults, setSelectedClassResults] = useState<any>(null);
  const [isResultsDialogOpen, setIsResultsDialogOpen] = useState(false);
  const [isLoadingResults, setIsLoadingResults] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [qRes, cRes] = await Promise.all([
        api.get('/edom/questions/all'),
        api.get('/edom/results/lecturer') // Admin gets all classes through this endpoint
      ]);
      setQuestions(qRes.data || []);
      setClasses(cRes.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat data EDOM");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openNewQuestion = () => {
    setEditingQuestion(null);
    setQText("");
    setQActive(true);
    setIsQuestionDialogOpen(true);
  };

  const openEditQuestion = (q: any) => {
    setEditingQuestion(q);
    setQText(q.question);
    setQActive(q.isActive);
    setIsQuestionDialogOpen(true);
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qText.trim()) return;

    try {
      setIsSubmitting(true);
      if (editingQuestion) {
        await api.patch(`/edom/questions/${editingQuestion.id}`, { question: qText, isActive: qActive });
        toast.success("Pertanyaan diperbarui");
      } else {
        await api.post('/edom/questions', { question: qText, isActive: qActive });
        toast.success("Pertanyaan ditambahkan");
      }
      setIsQuestionDialogOpen(false);
      fetchData();
    } catch (error) {
      toast.error("Gagal menyimpan pertanyaan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteQuestion = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus pertanyaan ini?")) return;
    try {
      await api.delete(`/edom/questions/${id}`);
      toast.success("Pertanyaan dihapus");
      fetchData();
    } catch (error) {
      toast.error("Gagal menghapus pertanyaan");
    }
  };

  const viewClassResults = async (classId: number) => {
    try {
      setIsLoadingResults(true);
      setSelectedClassResults(null);
      setIsResultsDialogOpen(true); // Buka dialog dulu biar kelihatan loading
      const res = await api.get(`/edom/results/class/${classId}`);
      setSelectedClassResults(res.data);
    } catch (error) {
      toast.error("Gagal memuat hasil EDOM kelas");
      setIsResultsDialogOpen(false);
    } finally {
      setIsLoadingResults(false);
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
        <h1 className="text-3xl font-bold mb-6">Manajemen EDOM</h1>

        <Tabs defaultValue="results" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="results">Hasil Evaluasi</TabsTrigger>
            <TabsTrigger value="questions">Pertanyaan Kuisioner</TabsTrigger>
          </TabsList>
          
          <TabsContent value="results">
            <div className="space-y-4">
              <p className="text-muted-foreground">Pilih kelas untuk melihat hasil rekapitulasi EDOM.</p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {classes.map(cls => (
                  <Card key={cls.id.toString()} className="cursor-pointer hover:border-primary transition-colors" onClick={() => viewClassResults(Number(cls.id))}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{cls.course?.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{cls.name} • {cls.academicYear?.year} {cls.academicYear?.semester}</p>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-1"><span className="font-medium">Dosen:</span> {cls.lecturer?.name}</p>
                      <div className="flex items-center justify-between text-sm mt-3 pt-3 border-t">
                        <span className="flex items-center gap-1 text-muted-foreground"><Users className="h-4 w-4" /> Partisipasi</span>
                        <span className="font-semibold">{cls._count?.edomSubmissions} / {cls._count?.students}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="questions">
            <div className="flex justify-between items-center mb-4">
              <p className="text-muted-foreground">Kelola pertanyaan yang akan diisi oleh mahasiswa.</p>
              <Button onClick={openNewQuestion}><Plus className="h-4 w-4 mr-2" /> Tambah Pertanyaan</Button>
            </div>
            
            <div className="space-y-3">
              {questions.map((q, i) => (
                <Card key={q.id.toString()}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-semibold text-lg">{i + 1}.</span>
                        <p className="text-base">{q.question}</p>
                      </div>
                      <Badge variant={q.isActive ? 'default' : 'secondary'} className="ml-6">
                        {q.isActive ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEditQuestion(q)}>Edit</Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteQuestion(Number(q.id))}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Dialog untuk Tambah/Edit Pertanyaan */}
        <Dialog open={isQuestionDialogOpen} onOpenChange={setIsQuestionDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingQuestion ? 'Edit Pertanyaan' : 'Tambah Pertanyaan Baru'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSaveQuestion} className="space-y-4">
              <div className="space-y-2">
                <Label>Teks Pertanyaan</Label>
                <Input value={qText} onChange={e => setQText(e.target.value)} placeholder="Contoh: Dosen menjelaskan materi dengan baik..." required />
              </div>
              <div className="flex items-center justify-between border p-3 rounded-lg">
                <div className="space-y-0.5">
                  <Label>Status Aktif</Label>
                  <p className="text-sm text-muted-foreground">Tampilkan pertanyaan ini di form mahasiswa</p>
                </div>
                <Switch checked={qActive} onCheckedChange={setQActive} />
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full">Simpan</Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog untuk Lihat Hasil Kelas */}
        <Dialog open={isResultsDialogOpen} onOpenChange={setIsResultsDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Hasil EDOM: {selectedClassResults?.class?.course?.name}</DialogTitle>
              <p className="text-sm text-muted-foreground">Kelas {selectedClassResults?.class?.name} • Dosen: {selectedClassResults?.class?.lecturer?.name}</p>
            </DialogHeader>
            
            {isLoadingResults ? (
              <div className="py-10 flex justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
            ) : selectedClassResults ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between bg-muted/30 p-4 rounded-lg border">
                  <div>
                    <p className="text-sm text-muted-foreground">Partisipasi Mahasiswa</p>
                    <p className="text-2xl font-bold">
                      {selectedClassResults.participation.percentage}%
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{selectedClassResults.participation.totalSubmissions} dari {selectedClassResults.participation.totalStudents} Submit</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3">Rata-rata Skor per Pertanyaan</h3>
                  <div className="space-y-3">
                    {selectedClassResults.questionResults.map((q: any, i: number) => (
                      <div key={q.questionId} className="flex flex-col gap-1">
                        <div className="flex justify-between text-sm">
                          <span className="flex-1 pr-4">{i + 1}. {q.question}</span>
                          <span className="font-bold whitespace-nowrap">{q.averageScore} / 5.00</span>
                        </div>
                        {/* Simple progress bar representation */}
                        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary" 
                            style={{ width: `${(q.averageScore / 5) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3">Saran & Masukan</h3>
                  <div className="space-y-3">
                    {selectedClassResults.feedbacks.length === 0 ? (
                      <p className="text-muted-foreground text-sm italic">Tidak ada masukan tertulis.</p>
                    ) : (
                      selectedClassResults.feedbacks.map((f: any, i: number) => (
                        <div key={i} className="bg-muted p-3 rounded-lg text-sm italic border-l-4 border-primary">
                          "{f.feedback}"
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-10 text-center">Gagal memuat data</div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </ClientAuthGuard>
  );
}
