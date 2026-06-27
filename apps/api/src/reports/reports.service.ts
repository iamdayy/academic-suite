import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthenticatedUser } from 'shared-types';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) { }

  private getGradeValue(grade: string | null): number {
    if (!grade) return 0;
    const g = grade.toUpperCase();
    if (g === 'A') return 4.0;
    if (g === 'B') return 3.0;
    if (g === 'C') return 2.0;
    if (g === 'D') return 1.0;
    return 0.0;
  }

  async getKhs(academicYearId: number, user: AuthenticatedUser) {
    if (!user.student?.id) throw new BadRequestException('Bukan student');

    const krs = await this.prisma.krsHeader.findFirst({
      where: {
        studentId: user.student.id,
        academicYearId,
        status: 'APPROVED' // Hanya yang sudah diapprove
      },
      include: {
        academicYear: true,
        krsDetails: {
          include: {
            class: {
              include: {
                course: true
              }
            }
          }
        }
      }
    });

    if (!krs) {
      throw new NotFoundException('KRS/KHS tidak ditemukan untuk semester ini atau belum disetujui');
    }

    const studentInfo = await this.prisma.student.findUnique({
      where: { id: user.student.id },
      include: { studyProgram: { include: { major: true } } }
    });

    let totalSks = 0;
    let totalScore = 0;

    const details = krs.krsDetails.map(detail => {
      const sks = detail.class.course.credits;
      const gradeValue = this.getGradeValue(detail.grade);
      const score = sks * gradeValue;
      
      totalSks += sks;
      totalScore += score;

      return {
        courseCode: detail.class.course.code,
        courseName: detail.class.course.name,
        sks,
        grade: detail.grade || '-',
        gradeValue,
        score
      };
    });

    const ips = totalSks > 0 ? (totalScore / totalSks) : 0;

    return {
      student: studentInfo,
      academicYear: krs.academicYear,
      semester: krs.semester,
      details,
      summary: {
        totalSks,
        ips: ips.toFixed(2)
      },
      signatureToken: `KHS-${krs.id}-${studentInfo?.nim}`
    };
  }

  async getTranscript(user: AuthenticatedUser) {
    if (!user.student?.id) throw new BadRequestException('Bukan student');

    // Ambil semua KRS yang APPROVED
    const krsList = await this.prisma.krsHeader.findMany({
      where: {
        studentId: user.student.id,
        status: 'APPROVED'
      },
      include: {
        krsDetails: {
          include: {
            class: {
              include: {
                course: true
              }
            }
          }
        }
      }
    });

    const studentInfo = await this.prisma.student.findUnique({
      where: { id: user.student.id },
      include: { studyProgram: { include: { major: true } } }
    });

    // Mengambil nilai terbaik per mata kuliah (jika ada retake)
    const bestGrades = new Map<bigint, any>();

    for (const krs of krsList) {
      for (const detail of krs.krsDetails) {
        const courseId = detail.class.course.id;
        const currentGradeValue = this.getGradeValue(detail.grade);
        
        if (!bestGrades.has(courseId)) {
          bestGrades.set(courseId, { detail, gradeValue: currentGradeValue });
        } else {
          const existing = bestGrades.get(courseId);
          if (currentGradeValue > existing.gradeValue) {
            bestGrades.set(courseId, { detail, gradeValue: currentGradeValue });
          }
        }
      }
    }

    let totalSks = 0;
    let totalScore = 0;

    const details = Array.from(bestGrades.values()).map(({ detail, gradeValue }) => {
      const sks = detail.class.course.credits;
      const score = sks * gradeValue;
      
      totalSks += sks;
      totalScore += score;

      return {
        courseCode: detail.class.course.code,
        courseName: detail.class.course.name,
        sks,
        grade: detail.grade || '-',
        gradeValue,
        score
      };
    }).sort((a, b) => a.courseName.localeCompare(b.courseName));

    const ipk = totalSks > 0 ? (totalScore / totalSks) : 0;

    return {
      student: studentInfo,
      details,
      summary: {
        totalSks,
        ipk: ipk.toFixed(2)
      },
      signatureToken: `TRANSCRIPT-${studentInfo?.nim}-${new Date().getTime()}`
    };
  }
}
