// 📁 apps/api/src/guardian-view/guardian-view.service.ts
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthenticatedUser } from 'shared-types';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GuardianViewService {
  constructor(private prisma: PrismaService) {}

  /**
   * [UNTUK WALI]
   * Mengambil daftar mahasiswa (anak) yang terhubung dengan wali yang login.
   */
  async getMyStudents(user: AuthenticatedUser) {
    // 1. Pastikan user adalah Wali dan memiliki profil
    if (!user.guardian) {
      throw new UnauthorizedException('User is not a guardian');
    }
    const guardianId = user.guardian.id;

    // 2. Cari semua koneksi di tabel pivot (GuardianStudent)
    const connections = await this.prisma.guardianStudent.findMany({
      where: { guardianId },
      include: {
        // 3. Sertakan data lengkap mahasiswa
        student: {
          include: {
            studyProgram: true,
            user: { select: { email: true } },
          },
        },
      },
    });

    // 4. Kembalikan hanya daftar mahasiswanya
    return connections.map((conn) => conn.student);
  }

  /**
   * [UNTUK WALI]
   * Mengambil detail akademik seorang mahasiswa,
   * HANYA jika wali terhubung dengan mahasiswa tersebut.
   */
  async getStudentDetails(studentId: number, user: AuthenticatedUser) {
    // 1. Pastikan user adalah Wali
    if (!user.guardian) {
      throw new UnauthorizedException('User is not a guardian');
    }
    const guardianId = user.guardian.id;

    // 2. Verifikasi koneksi di tabel pivot
    const connection = await this.prisma.guardianStudent.findFirst({
      where: {
        guardianId: guardianId,
        studentId: studentId,
      },
    });

    if (!connection) {
      // Jika tidak ada koneksi, Wali ini tidak berhak melihat
      throw new UnauthorizedException(
        'You are not authorized to view this student',
      );
    }

    // 3. Jika koneksi ada, ambil data lengkap mahasiswa
    const studentDetails = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: {
        studyProgram: true,
        user: { select: { email: true } },
        // Ambil riwayat KRS
        krsHeaders: {
          orderBy: { academicYear: { startDate: 'desc' } }, // Urutkan terbaru dulu
          include: {
            academicYear: true,
            krsDetails: {
              // Sertakan detail mata kuliah & nilai
              include: {
                class: {
                  include: {
                    course: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!studentDetails) {
      throw new NotFoundException('Student not found');
    }

    return studentDetails;
  }
}
