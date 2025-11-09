// 📁 apps/api/src/class-enrollment/class-enrollment.service.ts
import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthenticatedUser, Role } from 'shared-types';
import { PrismaService } from '../prisma/prisma.service';
import { EnrollStudentDto } from './dto/create-class-enrollment.dto';

@Injectable()
export class ClassEnrollmentService {
  constructor(private prisma: PrismaService) {}

  /**
   * [UNTUK ADMIN]
   * Mendaftarkan satu mahasiswa ke satu kelas.
   */
  async enrollStudent(dto: EnrollStudentDto) {
    const { studentId, classId } = dto;

    // Cek apakah sudah terdaftar
    const existingEnrollment = await this.prisma.classStudent.findFirst({
      where: { studentId, classId },
    });

    if (existingEnrollment) {
      throw new ConflictException('Student is already enrolled in this class');
    }

    // Daftarkan (Isi tabel pivot)
    return this.prisma.classStudent.create({
      data: {
        studentId,
        classId,
      },
      include: {
        student: true,
        class: true,
      },
    });
  }

  /**
   * [UNTUK ADMIN]
   * Melihat semua mahasiswa di satu kelas (Roster)
   */
  async getRosterByClass(classId: number, user: AuthenticatedUser) {
    // Jika user adalah DOSEN, verifikasi dia mengajar kelas ini
    if (user.role.roleName === Role.LECTURER) {
      if (!user.lecturer) {
        throw new UnauthorizedException('Lecturer information not found');
      }
      const classInstance = await this.prisma.class.findUnique({
        where: { id: classId },
      });
      if (!classInstance) {
        throw new NotFoundException('Class not found');
      }
      if (classInstance.lecturerId !== user.lecturer.id) {
        throw new UnauthorizedException('You do not own this class roster');
      }
    }
    return this.prisma.classStudent.findMany({
      where: { classId },
      include: {
        student: {
          include: { user: { select: { email: true } } },
        },
      },
    });
  }

  /**
   * [BARU] [UNTUK ADMIN]
   * Menghapus mahasiswa dari kelas (un-enroll).
   * 'id' di sini adalah ID dari baris di tabel ClassStudent.
   */
  async removeEnrollment(enrollmentId: number) {
    const enrollment = await this.prisma.classStudent.findUnique({
      where: { id: enrollmentId },
    });

    if (!enrollment) {
      throw new NotFoundException(
        `Enrollment record with ID ${enrollmentId} not found`,
      );
    }

    return this.prisma.classStudent.delete({
      where: { id: enrollmentId },
    });
  }
  /**
   * [UNTUK STUDENT]
   * Mengambil semua kelas yang diikuti (enrolled) oleh mahasiswa yang login.
   */
  async getMyClasses(user: AuthenticatedUser) {
    if (!user.student) {
      throw new UnauthorizedException('User is not a student');
    }
    const studentId = user.student.id;

    // 1. Cari semua pendaftaran (enrollment) mahasiswa
    const enrollments = await this.prisma.classStudent.findMany({
      where: { studentId: studentId },
      include: {
        // 2. Sertakan data kelas, matkul, dosen, dan jadwalnya
        class: {
          include: {
            course: true,
            lecturer: true,
            classSchedules: true, // Sertakan jadwal
          },
        },
      },
    });

    // 3. Kembalikan daftar kelas yang sudah di-format
    return enrollments.map((en) => en.class);
  }
}
