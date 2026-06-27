import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReportsService } from '../reports/reports.service';
import type { AuthenticatedUser } from 'shared-types';

@Injectable()
export class AlumniService {
  constructor(
    private prisma: PrismaService,
    private reportsService: ReportsService
  ) { }

  // ============================
  // YUDISIUM
  // ============================
  async applyYudisium(user: AuthenticatedUser) {
    if (!user.student?.id) throw new BadRequestException('Bukan student');

    const existing = await this.prisma.yudisiumRegistration.findUnique({
      where: { studentId: user.student.id }
    });

    if (existing) {
      throw new BadRequestException('Sudah mendaftar Yudisium sebelumnya');
    }

    // Kalkulasi SKS dan IPK (menggunakan KHS transcript logic)
    const transcript = await this.reportsService.getTranscript(user);
    if (transcript.summary.totalSks < 144) {
      throw new BadRequestException(`SKS kurang dari 144 (Saat ini: ${transcript.summary.totalSks} SKS). Tidak bisa mendaftar Yudisium.`);
    }

    // Pastikan status thesis sudah COMPLETE atau tidak ada tanggungan, tapi untuk MVP kita skip validasi thesis dulu atau cek kalau ada.
    // Di sini asumsi SKS >= 144 sudah cukup.

    return this.prisma.yudisiumRegistration.create({
      data: {
        studentId: user.student.id,
        ipk: parseFloat(transcript.summary.ipk),
        totalCredits: transcript.summary.totalSks,
        status: 'PENDING'
      }
    });
  }

  async getMyYudisium(user: AuthenticatedUser) {
    if (!user.student?.id) throw new BadRequestException('Bukan student');
    return this.prisma.yudisiumRegistration.findUnique({
      where: { studentId: user.student.id }
    });
  }

  async getAllYudisium() {
    return this.prisma.yudisiumRegistration.findMany({
      include: {
        student: {
          include: {
            studyProgram: {
              include: { major: true }
            }
          }
        }
      },
      orderBy: { appliedAt: 'desc' }
    });
  }

  async updateYudisiumStatus(id: number, status: string) {
    const yudisium = await this.prisma.yudisiumRegistration.findUnique({ where: { id } });
    if (!yudisium) throw new NotFoundException('Yudisium tidak ditemukan');

    const updated = await this.prisma.yudisiumRegistration.update({
      where: { id },
      data: { status }
    });

    if (status === 'APPROVED') {
      await this.prisma.student.update({
        where: { id: yudisium.studentId },
        data: { status: 'GRADUATED' }
      });
    }

    return updated;
  }

  // ============================
  // WISUDA
  // ============================
  async createWisudaEvent(dto: { batchName: string; eventDate: string }) {
    return this.prisma.wisudaEvent.create({
      data: {
        batchName: dto.batchName,
        eventDate: new Date(dto.eventDate),
        isActive: true
      }
    });
  }

  async getWisudaEvents() {
    return this.prisma.wisudaEvent.findMany({
      orderBy: { eventDate: 'desc' }
    });
  }

  async registerWisuda(eventId: number, user: AuthenticatedUser) {
    if (!user.student?.id) throw new BadRequestException('Bukan student');
    
    const student = await this.prisma.student.findUnique({ where: { id: user.student.id } });
    if (student?.status !== 'GRADUATED') {
      throw new ForbiddenException('Harus lulus Yudisium terlebih dahulu untuk mendaftar Wisuda');
    }

    const event = await this.prisma.wisudaEvent.findUnique({ where: { id: eventId } });
    if (!event || !event.isActive) throw new NotFoundException('Event wisuda tidak aktif atau tidak ditemukan');

    const existing = await this.prisma.wisudaRegistration.findUnique({
      where: { studentId: user.student.id }
    });

    if (existing) {
      throw new BadRequestException('Sudah terdaftar di acara Wisuda');
    }

    return this.prisma.wisudaRegistration.create({
      data: {
        studentId: user.student.id,
        wisudaEventId: eventId,
        status: 'REGISTERED'
      }
    });
  }

  async getWisudaParticipants(eventId: number) {
    return this.prisma.wisudaRegistration.findMany({
      where: { wisudaEventId: eventId },
      include: {
        student: {
          include: {
            studyProgram: true
          }
        }
      }
    });
  }

  async getMyWisuda(user: AuthenticatedUser) {
    if (!user.student?.id) throw new BadRequestException('Bukan student');
    return this.prisma.wisudaRegistration.findUnique({
      where: { studentId: user.student.id },
      include: { wisudaEvent: true }
    });
  }

  // ============================
  // TRACER STUDY
  // ============================
  async submitTracerStudy(dto: any, user: AuthenticatedUser) {
    if (!user.student?.id) throw new BadRequestException('Bukan student');

    const student = await this.prisma.student.findUnique({ where: { id: user.student.id } });
    if (student?.status !== 'GRADUATED') {
      throw new ForbiddenException('Hanya alumni yang bisa mengisi tracer study');
    }

    const existing = await this.prisma.tracerStudy.findUnique({
      where: { studentId: user.student.id }
    });

    if (existing) {
      return this.prisma.tracerStudy.update({
        where: { studentId: user.student.id },
        data: {
          employed: dto.employed,
          companyName: dto.companyName,
          salaryRange: dto.salaryRange,
          feedback: dto.feedback
        }
      });
    }

    return this.prisma.tracerStudy.create({
      data: {
        studentId: user.student.id,
        employed: dto.employed,
        companyName: dto.companyName,
        salaryRange: dto.salaryRange,
        feedback: dto.feedback
      }
    });
  }

  async getMyTracerStudy(user: AuthenticatedUser) {
    if (!user.student?.id) throw new BadRequestException('Bukan student');
    return this.prisma.tracerStudy.findUnique({
      where: { studentId: user.student.id }
    });
  }

  async getTracerStudies() {
    return this.prisma.tracerStudy.findMany({
      include: {
        student: {
          include: {
            studyProgram: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}
