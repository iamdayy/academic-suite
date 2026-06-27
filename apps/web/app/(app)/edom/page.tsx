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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import api from "@/lib/api";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function StudentEdomPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Dialog state
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [classesRes, qRes] = await Promise.all([
        api.get('/edom/classes'),
        api.get('/edom/questions')
      ]);
      setClasses(classesRes.data || []);
      setQuestions(qRes.data || []);
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

  const openForm = (cls: any) => {
    setSelectedClass(cls);
    setAnswers({});
    setFeedback("");
    setIsDialogOpen(true);
  };

  const handleScoreChange = (qId: number, val: string) => {
    setAnswers(prev => ({ ...prev, [qId]: parseInt(val) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(answers).length !== questions.length) {
      toast.error("Harap isi semua pertanyaan rating");
      return;
    }
    
    try {
      setIsSubmitting(true);
      const formattedAnswers = Object.entries(answers).map(([qId, score]) => ({
        questionId: Number(qId),
        score
      }));

      await api.post('/edom/submissions', {
        classId: selectedClass.classId,
        answers: formattedAnswers,
        feedback
      });

      toast.success("Evaluasi berhasil disubmit");
      setIsDialogOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal submit EDOM");
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
        <h1 className="text-3xl font-bold mb-2">Evaluasi Dosen Oleh Mahasiswa (EDOM)</h1>
        <p className="text-muted-foreground mb-6">Silakan isi evaluasi untuk kelas yang Anda ikuti pada semester ini.</p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.length === 0 ? (
            <p className="col-span-full text-center text-muted-foreground py-10">Anda tidak memiliki kelas yang memerlukan evaluasi saat ini.</p>
          ) : (
            classes.map(cls => (
              <Card key={cls.classId}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{cls.courseName}</CardTitle>
                    {cls.hasSubmittedEdom ? (
                      <Badge variant="default" className="bg-green-500">Selesai</Badge>
                    ) : (
                      <Badge variant="destructive">Belum</Badge>
                    )}
                  </div>
                  <CardDescription>{cls.courseCode} • {cls.className}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-2"><span className="font-semibold">Dosen:</span> {cls.lecturerName}</p>
                  <p className="text-sm mb-4"><span className="font-semibold">TA/SMT:</span> {cls.academicYear}</p>
                  
                  {!cls.hasSubmittedEdom ? (
                    <Button onClick={() => openForm(cls)} className="w-full">Isi Kuisioner</Button>
                  ) : (
                    <Button variant="outline" disabled className="w-full">Sudah Diisi</Button>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Isi EDOM - {selectedClass?.courseName}</DialogTitle>
              <p className="text-sm text-muted-foreground">Dosen: {selectedClass?.lecturerName}</p>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 py-4">
              {questions.map((q, i) => (
                <div key={q.id.toString()} className="space-y-3 bg-muted/30 p-4 rounded-lg border">
                  <Label className="text-base font-semibold">{i + 1}. {q.question}</Label>
                  <RadioGroup 
                    className="flex justify-between max-w-md mt-2" 
                    onValueChange={(v: string) => handleScoreChange(q.id.toString(), v)}
                  >
                    {[1, 2, 3, 4, 5].map(score => (
                      <div key={score} className="flex flex-col items-center gap-1">
                        <RadioGroupItem value={score.toString()} id={`q-${q.id}-${score}`} />
                        <Label htmlFor={`q-${q.id}-${score}`} className="text-xs cursor-pointer">{score}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                  <div className="flex justify-between max-w-md text-xs text-muted-foreground px-1">
                    <span>Sangat Kurang</span>
                    <span>Sangat Baik</span>
                  </div>
                </div>
              ))}

              <div className="space-y-2">
                <Label className="text-base font-semibold">Saran & Masukan (Opsional)</Label>
                <Textarea 
                  value={feedback} 
                  onChange={e => setFeedback(e.target.value)} 
                  placeholder="Tuliskan saran yang membangun untuk dosen pengampu..."
                  rows={4}
                />
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Menyimpan..." : "Submit Evaluasi"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </ClientAuthGuard>
  );
}
