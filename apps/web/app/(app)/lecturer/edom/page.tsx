"use client";

import ClientAuthGuard from "@/components/ClientAuthGuard";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import api from "@/lib/api";
import { Loader2, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function LecturerEdomPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Results Modal
  const [selectedClassResults, setSelectedClassResults] = useState<any>(null);
  const [isResultsDialogOpen, setIsResultsDialogOpen] = useState(false);
  const [isLoadingResults, setIsLoadingResults] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/edom/results/lecturer');
      setClasses(res.data || []);
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

  const viewClassResults = async (classId: number) => {
    try {
      setIsLoadingResults(true);
      setSelectedClassResults(null);
      setIsResultsDialogOpen(true);
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
        <h1 className="text-3xl font-bold mb-6">Hasil EDOM Kelas Anda</h1>
        <p className="text-muted-foreground mb-6">Berikut adalah daftar kelas yang Anda ampu dan hasil evaluasi dari mahasiswa.</p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.length === 0 ? (
            <p className="col-span-full text-center text-muted-foreground py-10">Anda tidak mengajar kelas apapun saat ini.</p>
          ) : (
            classes.map(cls => (
              <Card key={cls.id.toString()} className="cursor-pointer hover:border-primary transition-colors" onClick={() => viewClassResults(Number(cls.id))}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{cls.course?.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{cls.name} • {cls.academicYear?.year} {cls.academicYear?.semester}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm mt-1 pt-3 border-t">
                    <span className="flex items-center gap-1 text-muted-foreground"><Users className="h-4 w-4" /> Partisipasi</span>
                    <span className="font-semibold">{cls._count?.edomSubmissions} / {cls._count?.students}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

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
