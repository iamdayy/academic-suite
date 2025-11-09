// 📁 apps/api/src/attendance/attendance.service.ts
import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthenticatedUser } from 'shared-types';
import { PrismaService } from '../prisma/prisma.service';
import { OpenSessionDto } from './dto/open-session.dto';
import { RecordAttendanceDto } from './dto/record-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  /**
   * [UNTUK DOSEN]
   * Membuka sesi presensi baru.
   */
  async openSession(dto: OpenSessionDto, user: AuthenticatedUser) {
    const { classScheduleId, notes } = dto;

    // 1. Verifikasi Dosen adalah pemilik jadwal ini
    await this.verifyLecturerOwnership(classScheduleId, user);

    // 2. Cek apakah sudah ada sesi yang OPEN untuk jadwal ini
    const existingOpenSession = await this.prisma.attendanceSession.findFirst({
      where: { classScheduleId, status: 'OPEN' },
    });
    if (existingOpenSession) {
      throw new ConflictException(
        'Sesi presensi untuk jadwal ini sudah dibuka.',
      );
    }

    // 3. Buat sesi baru
    const now = new Date();
    return this.prisma.attendanceSession.create({
      data: {
        classScheduleId,
        notes,
        sessionDate: now,
        startTime: now,
        endTime: new Date(now.getTime() + 15 * 60000), // Sesi dibuka 15 menit
        status: 'OPEN',
      },
    });
  }

  /**
   * [UNTUK DOSEN]
   * Menutup sesi presensi secara manual.
   */
  async closeSession(sessionId: number, user: AuthenticatedUser) {
    const session = await this.findSessionById(sessionId);
    await this.verifyLecturerOwnership(Number(session.classScheduleId), user);

    return this.prisma.attendanceSession.update({
      where: { id: sessionId },
      data: { status: 'CLOSED', endTime: new Date() },
    });
  }

  /**
   * [UNTUK MAHASISWA]
   * Mahasiswa mencatat kehadiran mereka.
   */
  async recordMyAttendance(dto: RecordAttendanceDto, user: AuthenticatedUser) {
    const { sessionId, status } = dto;

    // 1. Pastikan user adalah Student
    if (!user.student) {
      throw new UnauthorizedException('User is not a student');
    }
    const studentId = user.student.id;

    // 2. Dapatkan sesi dan pastikan 'OPEN'
    const session = await this.findSessionById(sessionId);
    if (session.status !== 'OPEN') {
      throw new ConflictException('Sesi presensi sudah ditutup.');
    }

    // 3. Verifikasi mahasiswa terdaftar di kelas ini
    const classId = session.classSchedule.classId;
    const enrollment = await this.prisma.classStudent.findFirst({
      where: { classId, studentId },
    });
    if (!enrollment) {
      throw new UnauthorizedException('Anda tidak terdaftar di kelas ini.');
    }

    // 4. Catat kehadiran (upsert = create or update if already exists)
    return this.prisma.attendanceRecord.upsert({
      where: {
        attendanceSessionId_studentId: {
          attendanceSessionId: sessionId,
          studentId: Number(studentId),
        },
      },
      update: { status, attendedAt: new Date() }, // Update jika sudah ada (misal dari 'IZIN' jadi 'HADIR')
      create: {
        attendanceSessionId: sessionId,
        studentId: Number(studentId),
        status: status,
      },
    });
  }

  /**
   * [UNTUK DOSEN]
   * Melihat semua rekaman presensi untuk satu sesi.
   */
  async getSessionRecords(sessionId: number, user: AuthenticatedUser) {
    const session = await this.findSessionById(sessionId);
    await this.verifyLecturerOwnership(Number(session.classScheduleId), user);

    return this.prisma.attendanceRecord.findMany({
      where: { attendanceSessionId: sessionId },
      include: {
        student: {
          select: { name: true, nim: true },
        },
      },
    });
  }

  /**
   * [UNTUK MAHASISWA & DOSEN]
   * Mendapatkan sesi yang sedang aktif untuk sebuah kelas.
   */
  async getActiveSession(classId: number) {
    return this.prisma.attendanceSession.findFirst({
      where: {
        status: 'OPEN',
        classSchedule: {
          classId: classId,
        },
      },
    });
  }

  /**
   * [BARU] [UNTUK MAHASISWA]
   * Melihat rekaman absensi mereka sendiri untuk 1 sesi
   */
  async getMyRecordForSession(sessionId: number, user: AuthenticatedUser) {
    if (!user.student) {
      throw new UnauthorizedException('User is not a student');
    }
    return this.prisma.attendanceRecord.findUnique({
      where: {
        attendanceSessionId_studentId: {
          attendanceSessionId: sessionId,
          studentId: Number(user.student.id),
        },
      },
      select: {
        // Hanya kirim status, tidak perlu data lengkap
        status: true,
      },
    });
  }

  // --- Helper Functions ---

  private async findSessionById(sessionId: number) {
    const session = await this.prisma.attendanceSession.findUnique({
      where: { id: sessionId },
      include: { classSchedule: true },
    });
    if (!session) {
      throw new NotFoundException('Sesi presensi tidak ditemukan.');
    }
    return session;
  }

  private async verifyLecturerOwnership(
    classScheduleId: number,
    user: AuthenticatedUser,
  ) {
    if (!user.lecturer) {
      throw new UnauthorizedException('User is not a lecturer');
    }

    const schedule = await this.prisma.classSchedule.findUnique({
      where: { id: classScheduleId },
      include: { class: true },
    });

    if (!schedule) {
      throw new NotFoundException('Jadwal tidak ditemukan.');
    }

    if (schedule.class.lecturerId !== user.lecturer.id) {
      throw new UnauthorizedException('Anda bukan pengajar kelas ini.');
    }
    return schedule;
  }
}
