// 📁 apps/api/src/stats/stats.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthenticatedUser } from 'shared-types';
import { PrismaService } from '../prisma/prisma.service';

// Helper untuk mapping nilai (Anda mungkin ingin memindahkannya ke file terpisah)
const gradeToWeight = (grade: string | null): number | null => {
  if (!grade) return null;
  const gradeMap: { [key: string]: number } = {
    A: 4.0,
    B: 3.0,
    C: 2.0,
    D: 1.0,
    E: 0.0,
    // Tambahkan nilai lain jika ada (misal: A-, B+, dll.)
  };
  return gradeMap[grade] ?? null;
};

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  /**
   * [UNTUK ADMIN]
   * Mengambil statistik ringkasan untuk dashboard Admin.
   */
  async getAdminStats() {
    // Jalankan semua query count secara paralel
    const [userCount, studentCount, lecturerCount, courseCount] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.student.count(),
        this.prisma.lecturer.count(),
        this.prisma.course.count(),
      ]);

    // Anda juga bisa menambahkan chart data, misal:
    // const studentsPerProdi = await this.prisma.student.groupBy(...)

    return {
      totalUsers: userCount,
      totalStudents: studentCount,
      totalLecturers: lecturerCount,
      totalCourses: courseCount,
    };
  }

  /**
   * [BARU] [UNTUK MAHASISWA]
   * Mengambil statistik ringkasan untuk dashboard Mahasiswa.
   */
  async getStudentStats(user: AuthenticatedUser) {
    // 1. Pastikan user adalah Mahasiswa
    if (!user.student) {
      throw new UnauthorizedException('User is not a student');
    }
    const studentId = user.student.id;

    // 2. Ambil semua KrsDetail yang sudah disetujui (APPROVED)
    const approvedDetails = await this.prisma.krsDetail.findMany({
      where: {
        krsHeader: {
          studentId: studentId,
          status: 'APPROVED', // Hanya hitung KRS yang sudah disetujui
        },
        grade: {
          not: null, // Hanya hitung yang sudah ada nilainya
        },
      },
      include: {
        course: {
          select: { credits: true }, // Kita butuh SKS mata kuliah
        },
      },
    });

    let totalSKS = 0;
    let totalBobot = 0;

    approvedDetails.forEach((detail) => {
      const weight = gradeToWeight(detail.grade);
      const sks = detail.course.credits;

      if (weight !== null && sks) {
        totalSKS += sks;
        totalBobot += weight * sks;
      }
    });

    // 3. Hitung IPK
    const ipk = totalSKS > 0 ? totalBobot / totalSKS : 0.0;

    // 4. Hitung SKS yang sedang diambil (KRS status DRAFT)
    const takingCredits = await this.prisma.krsDetail.count({
      where: {
        krsHeader: {
          studentId: studentId,
          status: 'DRAFT', // KRS yang masih DRAFT
        },
      },
    });

    return {
      ipk: ipk.toFixed(2), // Format 2 angka desimal
      totalSKS: totalSKS, // Total SKS yang sudah lulus
      takingCredits: takingCredits, // SKS sedang diambil (placeholder, ini menghitung jumlah matkul)
      // Anda bisa ubah 'count()' di atas menjadi 'aggregate({ _sum: { course: { credits } } })'
      // tapi itu query yang lebih kompleks.
    };
  }

  /**
   * [BARU] [UNTUK DOSEN]
   * Mengambil statistik ringkasan untuk dashboard Dosen.
   */
  async getLecturerStats(user: AuthenticatedUser) {
    // 1. Pastikan user adalah Dosen
    if (!user.lecturer) {
      throw new UnauthorizedException('User is not a lecturer');
    }
    const lecturerId = user.lecturer.id;

    // 2. Dapatkan ID Tahun Ajaran yang 'aktif' (misalnya 1 tahun terakhir)
    // Ini adalah asumsi sederhana, Anda bisa membuatnya lebih kompleks
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const activeAcademicYears = await this.prisma.academicYear.findMany({
      where: {
        endDate: { gte: oneYearAgo }, // Ambil T.A. yang berakhir dalam 1 tahun terakhir
      },
      select: { id: true },
    });
    const activeYearIds = activeAcademicYears.map((y) => y.id);

    // 3. Hitung kelas aktif yang diajar dosen ini
    const activeClassesCount = await this.prisma.class.count({
      where: {
        lecturerId: lecturerId,
        academicYearId: {
          in: activeYearIds,
        },
      },
    });

    // 4. Hitung total mahasiswa di kelas-kelas aktif tersebut
    // Ini adalah query yang lebih kompleks
    const studentEnrollments = await this.prisma.classStudent.count({
      where: {
        class: {
          lecturerId: lecturerId,
          academicYearId: {
            in: activeYearIds,
          },
        },
      },
    });

    // 5. Hitung total tugas yang belum dinilai (placeholder)
    const pendingSubmissions = await this.prisma.assignmentSubmission.count({
      where: {
        grade: null, // Belum dinilai
        assignment: {
          class: {
            lecturerId: lecturerId, // Tugas dari kelas yang diajar
            academicYearId: {
              in: activeYearIds, // Di T.A. aktif
            },
          },
        },
      },
    });

    return {
      activeClasses: activeClassesCount,
      totalStudentsEnrolled: studentEnrollments,
      pendingSubmissions: pendingSubmissions,
    };
  }
}
