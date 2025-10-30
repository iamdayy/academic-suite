// 📁 apps/api/src/assignment-submissions/assignment-submissions.service.ts

import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthenticatedUser } from 'shared-types';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssignmentSubmissionDto } from './dto/create-assignment-submission.dto';
import { GradeSubmissionDto } from './dto/grade-submission.dto';

@Injectable()
export class AssignmentSubmissionsService {
  constructor(private prisma: PrismaService) {}

  /**
   * [PRIVATE] Helper untuk memverifikasi apakah Student
   * terdaftar (enrolled) di kelas dari tugas tersebut.
   */
  private async verifyStudentEnrollment(
    assignmentId: number,
    user: AuthenticatedUser,
  ) {
    // 1. Pastikan user adalah Student
    if (!user.student) {
      throw new UnauthorizedException('User is not a student');
    }
    const studentId = user.student.id;

    // 2. Dapatkan Tugas & ID Kelasnya
    const assignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
    });
    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }
    const classId = assignment.classId;

    // 3. Cek di tabel 'ClassStudent' apakah mahasiswa terdaftar di kelas itu
    const enrollment = await this.prisma.classStudent.findFirst({
      where: {
        classId: classId,
        studentId: studentId,
      },
    });

    if (!enrollment) {
      throw new UnauthorizedException('You are not enrolled in this class');
    }

    return { studentId, assignment };
  }

  /**
   * [UNTUK STUDENT]
   * Mengumpulkan tugas.
   */
  async create(
    createDto: CreateAssignmentSubmissionDto,
    user: AuthenticatedUser,
  ) {
    const { assignmentId, fileUrl } = createDto;

    // 1. Verifikasi apakah mahasiswa terdaftar di kelas ini
    const { studentId } = await this.verifyStudentEnrollment(
      assignmentId,
      user,
    );

    if (!studentId) {
      throw new NotFoundException('Student not found');
    }

    // 2. Cek apakah sudah pernah mengumpulkan (Schema kita sudah unik,
    //    tapi ini memberikan pesan error yang lebih baik)
    const existingSubmission =
      await this.prisma.assignmentSubmission.findUnique({
        where: {
          assignmentId_studentId: {
            assignmentId,
            studentId,
          },
        },
      });

    if (existingSubmission) {
      throw new ConflictException(
        'You have already submitted for this assignment',
      );
    }

    // 3. Buat data pengumpulan
    return this.prisma.assignmentSubmission.create({
      data: {
        assignmentId,
        studentId,
        fileUrl,
      },
    });
  }

  /**
   * [UNTUK STUDENT]
   * Melihat submission mereka sendiri untuk tugas tertentu.
   */
  async findMySubmission(assignmentId: number, user: AuthenticatedUser) {
    if (!user.student) {
      throw new UnauthorizedException('User is not a student');
    }
    const studentId = user.student.id;
    if (!studentId) {
      throw new NotFoundException('Student not found');
    }

    return this.prisma.assignmentSubmission.findUnique({
      where: {
        assignmentId_studentId: {
          assignmentId,
          studentId,
        },
      },
    });
  }

  /**
   * [BARU] [PRIVATE] Helper untuk memverifikasi apakah Dosen
   * adalah pemilik (pengajar) dari kelas tempat tugas ini berada.
   */
  private async verifyLecturerOwnership(
    assignmentId: number,
    user: AuthenticatedUser,
  ) {
    if (!user.lecturer) {
      throw new UnauthorizedException('User is not a lecturer');
    }
    const lecturerId = user.lecturer.id;

    const assignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { class: true },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    if (assignment.class.lecturerId !== lecturerId) {
      throw new UnauthorizedException('You do not own this assignment');
    }

    return assignment;
  }

  /**
   * [UNTUK LECTURER]
   * Melihat semua submission untuk satu tugas.
   */
  findAllByAssignment(assignmentId: number) {
    return this.prisma.assignmentSubmission.findMany({
      where: { assignmentId },
      include: {
        student: true, // Sertakan data mahasiswa yang mengumpulkan
      },
    });
  }

  /**
   * [BARU] [UNTUK DOSEN]
   * Memberikan nilai pada sebuah submission.
   */
  async gradeSubmission(
    submissionId: number,
    gradeDto: GradeSubmissionDto,
    user: AuthenticatedUser,
  ) {
    // 1. Dapatkan submission
    const submission = await this.prisma.assignmentSubmission.findUnique({
      where: { id: submissionId },
    });
    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    // 2. Verifikasi bahwa Dosen ini berhak menilai (dia mengajar kelas ini)
    await this.verifyLecturerOwnership(Number(submission.assignmentId), user);

    // 3. Update nilai
    return this.prisma.assignmentSubmission.update({
      where: { id: submissionId },
      data: {
        grade: gradeDto.grade,
      },
    });
  }

  /**
   * [UNTUK STUDENT]
   * Menghapus/Membatalkan submission.
   */
  async remove(id: number, user: AuthenticatedUser) {
    if (!user.student) {
      throw new UnauthorizedException('User is not a student');
    }
    const studentId = user.student.id;

    // 1. Dapatkan submission
    const submission = await this.prisma.assignmentSubmission.findUnique({
      where: { id },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    // 2. Verifikasi Kepemilikan
    if (submission.studentId !== studentId) {
      throw new UnauthorizedException('You do not own this submission');
    }

    // 3. Hapus
    return this.prisma.assignmentSubmission.delete({
      where: { id },
    });
  }
}
