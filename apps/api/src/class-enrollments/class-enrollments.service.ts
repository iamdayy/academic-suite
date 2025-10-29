// 📁 apps/api/src/class-enrollment/class-enrollment.service.ts
import { ConflictException, Injectable } from '@nestjs/common';
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
  getRosterByClass(classId: number) {
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
