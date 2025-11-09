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
}
