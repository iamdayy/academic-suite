// 📁 apps/web/components/StudentAttendanceButton.tsx
"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface ActiveSession {
  id: bigint;
  classScheduleId: bigint;
}
interface StudentAttendanceButtonProps {
  classId: bigint;
  scheduleId: bigint;
}

export function StudentAttendanceButton({
  classId,
  scheduleId,
}: StudentAttendanceButtonProps) {
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [myRecord, setMyRecord] = useState<{ status: string } | null>(null);

  // Buat fungsi pengecekan yang bisa dipanggil ulang
  const checkSession = useCallback(async () => {
    try {
      const response = await api.get(`/attendance/session/active/${classId}`);
      const session = response.data;

      if (session && session.classScheduleId === scheduleId) {
        setActiveSession(session);
        // Jika sesi aktif, cek apakah kita sudah absen
        const recordRes = await api.get(`/attendance/record/my/${session.id}`);
        setMyRecord(recordRes.data);
      } else {
        setActiveSession(null);
        setMyRecord(null);
      }
    } catch (error) {
      console.error("Error checking session:", error);
    } finally {
      setIsLoading(false);
    }
  }, [classId, scheduleId]);

  // Polling: Cek sesi saat komponen dimuat, lalu setiap 30 detik
  useEffect(() => {
    checkSession(); // Cek langsung
    const interval = setInterval(checkSession, 30000); // Cek setiap 30 detik
    return () => clearInterval(interval); // Bersihkan interval saat komponen hancur
  }, [checkSession]);

  const handleAttend = async () => {
    if (!activeSession) return;
    setIsSubmitting(true);

    try {
      await api.post("/attendance/record", {
        sessionId: Number(activeSession.id),
        status: "HADIR", // Mahasiswa hanya bisa 'HADIR' lewat sini
      });
      toast.success("Berhasil absen!");
      setMyRecord({ status: "HADIR" }); // Update UI langsung
    } catch (error: any) {
      toast.error("Gagal absen.");
      console.error("Error marking attendance:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />;
  }

  if (myRecord) {
    return (
      <Button variant="ghost" size="sm" disabled className="text-green-500">
        <CheckCircle className="mr-2 h-4 w-4" /> Sudah Hadir
      </Button>
    );
  }

  if (activeSession) {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button size="sm" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "HADIR"
            )}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Kehadiran</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin mencatat kehadiran Anda sekarang?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleAttend}>
              Ya, Hadir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <Button variant="outline" size="sm" disabled>
      <XCircle className="mr-2 h-4 w-4" /> Sesi Ditutup
    </Button>
  );
}
