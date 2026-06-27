import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEdomQuestionDto } from './dto/create-edom-question.dto';
import { SubmitEdomDto } from './dto/submit-edom.dto';
import type { AuthenticatedUser } from 'shared-types';

@Injectable()
export class EdomService {
  constructor(private prisma: PrismaService) { }

  // -- QUESTIONS --
  createQuestion(dto: CreateEdomQuestionDto) {
    return this.prisma.edomQuestion.create({
      data: { question: dto.question, isActive: dto.isActive ?? true }
    });
  }

  updateQuestion(id: number, dto: CreateEdomQuestionDto) {
    return this.prisma.edomQuestion.update({
      where: { id },
      data: { question: dto.question, isActive: dto.isActive }
    });
  }

  deleteQuestion(id: number) {
    return this.prisma.edomQuestion.delete({ where: { id } });
  }

  getActiveQuestions() {
    return this.prisma.edomQuestion.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' }
    });
  }

  getAllQuestions() {
    return this.prisma.edomQuestion.findMany({
      orderBy: { createdAt: 'asc' }
    });
  }

  // -- STUDENT CLASSES & SUBMISSION --
  async getStudentClasses(user: AuthenticatedUser) {
    if (!user.student?.id) throw new BadRequestException('Bukan student');

    // Ambil kelas yang diambil student
    const classes = await this.prisma.classStudent.findMany({
      where: { studentId: user.student.id },
      include: {
        class: {
          include: {
            course: true,
            lecturer: true,
            academicYear: true
          }
        }
      }
    });

    // Ambil submission edom student ini
    const submissions = await this.prisma.edomSubmission.findMany({
      where: { studentId: user.student.id }
    });

    const submissionSet = new Set(submissions.map(s => Number(s.classId)));

    return classes.map(cs => ({
      classId: cs.class.id,
      className: cs.class.name,
      courseCode: cs.class.course.code,
      courseName: cs.class.course.name,
      lecturerName: cs.class.lecturer.name,
      academicYear: `${cs.class.academicYear.year} ${cs.class.academicYear.semester}`,
      hasSubmittedEdom: submissionSet.has(Number(cs.class.id))
    }));
  }

  async submitEdom(dto: SubmitEdomDto, user: AuthenticatedUser) {
    if (!user.student?.id) throw new BadRequestException('Bukan student');

    const isEnrolled = await this.prisma.classStudent.findUnique({
      where: { classId_studentId: { classId: dto.classId, studentId: user.student.id } }
    });

    if (!isEnrolled) throw new ForbiddenException('Bukan peserta kelas ini');

    const existing = await this.prisma.edomSubmission.findUnique({
      where: { studentId_classId: { classId: dto.classId, studentId: user.student.id } }
    });

    if (existing) throw new BadRequestException('Sudah submit EDOM untuk kelas ini');

    return this.prisma.$transaction(async (tx) => {
      const submission = await tx.edomSubmission.create({
        data: {
          classId: dto.classId,
          studentId: user.student?.id as bigint,
          feedback: dto.feedback
        }
      });

      if (dto.answers && dto.answers.length > 0) {
        const answerData = dto.answers.map(ans => ({
          submissionId: submission.id,
          questionId: ans.questionId,
          score: ans.score
        }));

        await tx.edomAnswer.createMany({ data: answerData });
      }

      return submission;
    });
  }

  // -- RESULTS --
  async getLecturerClasses(user: AuthenticatedUser) {
    // Jika role LECTURER, filter berdasarkan lecturerId
    const whereClause: any = {};
    if (user.role.roleName === 'LECTURER') {
      if (!user.lecturer?.id) throw new BadRequestException('Bukan lecturer');
      whereClause.lecturerId = user.lecturer.id;
    }

    const classes = await this.prisma.class.findMany({
      where: whereClause,
      include: {
        course: true,
        academicYear: true,
        lecturer: true,
        _count: {
          select: { students: true, edomSubmissions: true }
        }
      },
      orderBy: { academicYearId: 'desc' }
    });

    return classes;
  }

  async getClassResults(classId: number, user: AuthenticatedUser) {
    const cls = await this.prisma.class.findUnique({
      where: { id: classId },
      include: { course: true, lecturer: true, academicYear: true }
    });

    if (!cls) throw new NotFoundException('Kelas tidak ditemukan');

    if (user.role.roleName === 'LECTURER' && cls.lecturerId !== user.lecturer?.id) {
      throw new ForbiddenException('Hanya dosen pengampu yang bisa melihat');
    }

    // Hitung rata-rata per pertanyaan
    const questions = await this.prisma.edomQuestion.findMany();
    const answers = await this.prisma.edomAnswer.findMany({
      where: { submission: { classId } }
    });

    const results = questions.map(q => {
      const qAnswers = answers.filter(a => Number(a.questionId) === Number(q.id));
      const total = qAnswers.reduce((sum, a) => sum + a.score, 0);
      const avg = qAnswers.length > 0 ? (total / qAnswers.length).toFixed(2) : 0;
      return {
        questionId: q.id,
        question: q.question,
        averageScore: Number(avg),
        respondents: qAnswers.length
      };
    });

    // Ambil feedback
    const submissions = await this.prisma.edomSubmission.findMany({
      where: { classId, feedback: { not: null } },
      select: { feedback: true, createdAt: true }
    });

    const totalStudents = await this.prisma.classStudent.count({ where: { classId } });
    const totalSubmissions = await this.prisma.edomSubmission.count({ where: { classId } });

    return {
      class: cls,
      participation: {
        totalStudents,
        totalSubmissions,
        percentage: totalStudents > 0 ? ((totalSubmissions / totalStudents) * 100).toFixed(1) : 0
      },
      questionResults: results,
      feedbacks: submissions.filter(s => s.feedback && s.feedback.trim() !== '')
    };
  }
}
