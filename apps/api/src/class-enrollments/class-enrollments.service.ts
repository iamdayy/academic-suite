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
}
