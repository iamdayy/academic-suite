// 📁 apps/api/src/class-schedules/class-schedules.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClassScheduleDto } from './dto/create-class-schedule.dto';
import { UpdateClassScheduleDto } from './dto/update-class-schedule.dto';

@Injectable()
export class ClassSchedulesService {
  constructor(private prisma: PrismaService) {}

  /**
   * [UNTUK ADMIN]
   * Membuat jadwal baru untuk sebuah kelas.
   */
  async create(createDto: CreateClassScheduleDto) {
    // Verifikasi apakah kelasnya ada
    const classExists = await this.prisma.class.findUnique({
      where: { id: createDto.classId },
    });
    if (!classExists) {
      throw new NotFoundException(
        `Class with ID ${createDto.classId} not found`,
      );
    }

    return this.prisma.classSchedule.create({
      data: createDto,
    });
  }

  /**
   * [UNTUK SEMUA ROLE]
   * Menampilkan semua jadwal untuk satu kelas.
   */
  findAllByClass(classId: number) {
    return this.prisma.classSchedule.findMany({
      where: { classId },
      include: { facility: true },
      orderBy: {
        startTime: 'asc', // Urutkan berdasarkan jam mulai
      },
    });
  }

  /**
   * [UNTUK ADMIN]
   * Mengupdate satu jadwal.
   */
  async update(id: number, updateDto: UpdateClassScheduleDto) {
    // Cek apakah jadwalnya ada
    await this.findOne(id);
    return this.prisma.classSchedule.update({
      where: { id },
      data: updateDto,
    });
  }

  /**
   * [UNTUK ADMIN]
   * Menghapus satu jadwal.
   */
  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.classSchedule.delete({ where: { id } });
  }

  // Helper untuk cek keberadaan
  private async findOne(id: number) {
    const schedule = await this.prisma.classSchedule.findUnique({
      where: { id },
    });
    if (!schedule) {
      throw new NotFoundException(`Schedule with ID ${id} not found`);
    }
    return schedule;
  }

  /**
   * [UNTUK ADMIN]
   * Generate jadwal otomatis berdasarkan SKS dan melewati kelas yang sudah memiliki jadwal.
   */
  async generateAutoSchedule(academicYearId: number) {
    // 1. Ambil semua kelas di tahun ajaran tersebut
    const classes = await this.prisma.class.findMany({
      where: { academicYearId },
      include: {
        course: true,
        classSchedules: true,
      },
    });

    // 2. Ambil semua fasilitas aktif (tidak dibatasi tipe)
    const facilities = await this.prisma.facility.findMany({
      where: { isActive: true },
    });

    if (facilities.length === 0) {
      throw new Error('Tidak ada fasilitas/ruangan yang aktif.');
    }

    // 3. Ambil semua jadwal yang sudah ada (untuk mencegah bentrok)
    const existingSchedules = await this.prisma.classSchedule.findMany({
      where: {
        class: { academicYearId },
      },
      include: { class: true },
    });

    // Helper: Konversi "HH:mm" ke menit
    const timeToMins = (time: string) => {
      const [h, m] = time.split(':').map(Number);
      return h * 60 + m;
    };

    // Helper: Konversi menit ke "HH:mm"
    const minsToTime = (mins: number) => {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    };

    // Helper: Cek bentrok dua rentang waktu
    const isOverlap = (s1: number, e1: number, s2: number, e2: number) => {
      return Math.max(s1, s2) < Math.min(e1, e2);
    };

    const days = ['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT'];
    const startOfDayMins = 8 * 60; // 08:00
    const endOfDayMins = 17 * 60; // 17:00

    // Simpan jadwal yang baru dibuat di memory untuk cek bentrok dengan jadwal baru lainnya
    const newSchedules: any[] = [];

    // Fungsi gabungan untuk cek bentrok dengan jadwal lama & baru
    const checkConflict = (
      lecturerId: bigint,
      facilityId: bigint,
      day: string,
      startMins: number,
      endMins: number,
    ) => {
      // Cek di existing schedules
      for (const ex of existingSchedules) {
        if (ex.dayOfWeek !== day) continue;
        const exStart = timeToMins(ex.startTime);
        const exEnd = timeToMins(ex.endTime);
        if (isOverlap(startMins, endMins, exStart, exEnd)) {
          // Jika waktu bentrok, cek apakah dosennya sama ATAU ruangannya sama
          if (ex.class.lecturerId === lecturerId || ex.facilityId === facilityId) {
            return true;
          }
        }
      }
      // Cek di new schedules
      for (const ns of newSchedules) {
        if (ns.dayOfWeek !== day) continue;
        const nsStart = timeToMins(ns.startTime);
        const nsEnd = timeToMins(ns.endTime);
        if (isOverlap(startMins, endMins, nsStart, nsEnd)) {
          if (ns.lecturerId === lecturerId || ns.facilityId === facilityId) {
            return true;
          }
        }
      }
      return false;
    };

    let generatedCount = 0;

    // 4. Proses setiap kelas
    for (const cls of classes) {
      // Melewati (skip) kelas yang sudah punya jadwal
      if (cls.classSchedules.length > 0) {
        continue;
      }

      const credits = cls.course.credits || 0;
      if (credits <= 0) continue; // Skip jika SKS tidak valid

      const durationMins = credits * 50; // 1 SKS = 50 menit
      let scheduled = false;

      // Coba assign ke hari, ruangan, dan waktu
      for (const day of days) {
        if (scheduled) break;

        for (const facility of facilities) {
          if (scheduled) break;

          // Coba cari slot waktu dari jam 08:00 sampai 17:00, dengan lompatan 30 menit
          for (let currentMins = startOfDayMins; currentMins + durationMins <= endOfDayMins; currentMins += 30) {
            const endMins = currentMins + durationMins;

            const conflict = checkConflict(
              cls.lecturerId,
              facility.id,
              day,
              currentMins,
              endMins,
            );

            if (!conflict) {
              // Dapatkan slot ini!
              newSchedules.push({
                classId: cls.id,
                lecturerId: cls.lecturerId, // Disimpan untuk cek bentrok di atas (tidak masuk ke DB di createMany ini)
                facilityId: facility.id,
                dayOfWeek: day,
                startTime: minsToTime(currentMins),
                endTime: minsToTime(endMins),
              });
              scheduled = true;
              generatedCount++;
              break;
            }
          }
        }
      }

      if (!scheduled) {
        console.warn(`Tidak dapat menemukan jadwal kosong untuk kelas ${cls.name} (${cls.course.name})`);
      }
    }

    // 5. Simpan ke database
    if (newSchedules.length > 0) {
      const dataToInsert = newSchedules.map((ns) => ({
        classId: ns.classId,
        facilityId: ns.facilityId,
        dayOfWeek: ns.dayOfWeek,
        startTime: ns.startTime,
        endTime: ns.endTime,
      }));

      await this.prisma.classSchedule.createMany({
        data: dataToInsert,
      });
    }

    return {
      message: `Berhasil membuat ${generatedCount} jadwal secara otomatis.`,
      generatedCount,
    };
  }
}
