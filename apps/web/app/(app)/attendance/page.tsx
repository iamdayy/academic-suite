// 📁 apps/web/app/(app)/attendance/page.tsx
"use client";

import ClientAuthGuard from "@/components/ClientAuthGuard";
import { StudentAttendanceButton } from "@/components/StudentAttendanceButton"; // <-- Kita akan buat ini
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import api from "@/lib/api";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

// Definisikan tipe datanya
interface Schedule {
  id: bigint;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room: string;
}
interface MyClass {
  id: bigint;
  name: string;
  course: { code: string; name: string };
  lecturer: { name: string };
  classSchedules: Schedule[];
}

export default function MyAttendancePage() {
  const [myClasses, setMyClasses] = useState<MyClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Kita butuh fungsi 'fetchMyClasses' yang bisa dipanggil ulang
  const fetchMyClasses = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/class-enrollment/my-classes");
      setMyClasses(response.data);
    } catch (error) {
      console.error("Gagal mengambil data kelas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyClasses();
  }, []);

  return (
    <ClientAuthGuard>
      <div>
        <h1 className="text-3xl font-bold mb-6">Presensi Saya</h1>
        <p className="text-muted-foreground mb-6">
          Daftar kelas Anda. Tombol &quot;HADIR&quot; hanya akan aktif jika
          dosen telah membuka sesi presensi untuk jadwal yang sesuai.
        </p>

        {isLoading ? (
          <div className="flex justify-center mt-10">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {myClasses.map((cls) => (
              <Card key={cls.id.toString()}>
                <CardHeader>
                  <CardTitle>{cls.course.name}</CardTitle>
                  <CardDescription>
                    ({cls.course.code}) - {cls.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-medium">
                    Dosen: {cls.lecturer.name}
                  </p>
                  <div className="mt-4 space-y-2">
                    <h4 className="text-sm font-semibold">
                      Jadwal & Presensi:
                    </h4>
                    {cls.classSchedules.length > 0 ? (
                      cls.classSchedules.map((sch) => (
                        <div
                          key={sch.id.toString()}
                          className="flex justify-between items-center p-3 bg-muted rounded-md"
                        >
                          <div>
                            <p className="font-medium">{sch.dayOfWeek}</p>
                            <p className="text-sm text-muted-foreground">
                              {sch.startTime} - {sch.endTime}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {sch.room}
                            </p>
                          </div>
                          {/* Tombol Aksi "Cerdas" */}
                          <StudentAttendanceButton
                            classId={cls.id}
                            scheduleId={sch.id}
                          />
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Belum ada jadwal.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {myClasses.length === 0 && (
              <p className="text-center text-muted-foreground col-span-full mt-10">
                Anda belum terdaftar di kelas manapun.
              </p>
            )}
          </div>
        )}
      </div>
    </ClientAuthGuard>
  );
}
