// 📁 apps/web/components/ScheduleFormDialog.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/lib/api";
import { Edit, Loader2, PlusCircle } from "lucide-react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

// Definisikan tipe data
interface Schedule {
  id: bigint;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room: string;
}

// Definisikan props
interface ScheduleFormDialogProps {
  classId: bigint; // Dibutuhkan untuk 'Create'
  schedule?: Schedule; // Jika ada, ini mode 'Edit'
  onSuccess: () => void; // Callback untuk refresh tabel
}

// Opsi Hari
const daysOfWeek = [
  "SENIN",
  "SELASA",
  "RABU",
  "KAMIS",
  "JUMAT",
  "SABTU",
  "MINGGU",
];

export function ScheduleFormDialog({
  classId,
  schedule,
  onSuccess,
}: ScheduleFormDialogProps) {
  const isEditMode = !!schedule;

  // 1. Isi form dengan data yang ada
  const [dayOfWeek, setDayOfWeek] = useState(schedule?.dayOfWeek || "");
  const [startTime, setStartTime] = useState(schedule?.startTime || "");
  const [endTime, setEndTime] = useState(schedule?.endTime || "");
  const [room, setRoom] = useState(schedule?.room || "");

  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = {
      classId: Number(classId), // Selalu kirim classId
      dayOfWeek,
      startTime,
      endTime,
      room,
    };

    // Hapus classId dari payload jika mode Edit
    if (isEditMode) {
      // @ts-expect-error: classId is not optional in payload type, but it's not sent in edit mode
      delete payload.classId;
    }

    try {
      if (isEditMode) {
        // 2. Panggil API PATCH (Update)
        await api.patch(`/class-schedules/${schedule.id}`, payload);
        toast.success("Berhasil mengupdate jadwal!");
      } else {
        // 3. Panggil API POST (Create)
        await api.post("/class-schedules", payload);
        toast.error("Berhasil menyimpan jadwal!");
      }

      setIsOpen(false);
      onSuccess(); // Panggil callback untuk refresh data!
    } catch (error: any) {
      console.error("Gagal menyimpan jadwal:", error);
      toast.error("Gagal menyimpan jadwal");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form saat ditutup (jika mode Tambah)
  const handleOpenChange = (open: boolean) => {
    if (!open && !isEditMode) {
      setDayOfWeek("");
      setStartTime("");
      setEndTime("");
      setRoom("");
    }
    setIsOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {isEditMode ? (
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
        ) : (
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Tambah Jadwal
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Edit Jadwal" : "Tambah Jadwal Baru"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="day">Hari</Label>
              <Select value={dayOfWeek} onValueChange={setDayOfWeek} required>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Hari" />
                </SelectTrigger>
                <SelectContent>
                  {daysOfWeek.map((day) => (
                    <SelectItem key={day} value={day}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Jam Mulai</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">Jam Selesai</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="room">Ruangan</Label>
              <Input
                id="room"
                placeholder="Contoh: G-201"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Batal
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
