import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { UpdateLeaveRequestDto } from './dto/update-leave-request.dto';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedUser } from 'shared-types';

@Injectable()
export class LeaveRequestsService {
  constructor(private prisma: PrismaService) { }

  async create(createLeaveRequestDto: CreateLeaveRequestDto, user: AuthenticatedUser) {
    if (!user.student?.id) {
      throw new BadRequestException('Only students can apply for leave');
    }

    // Check if there is already a pending request
    const existing = await this.prisma.leaveRequest.findFirst({
      where: {
        studentId: user.student.id,
        status: 'PENDING'
      }
    });

    if (existing) {
      throw new BadRequestException('You already have a pending leave request');
    }

    return this.prisma.leaveRequest.create({
      data: {
        studentId: user.student.id,
        academicYearId: createLeaveRequestDto.academicYearId,
        reason: createLeaveRequestDto.reason,
        documentUrl: createLeaveRequestDto.documentUrl,
        status: 'PENDING'
      }
    });
  }

  findAll() {
    return this.prisma.leaveRequest.findMany({
      include: {
        student: { include: { studyProgram: true, user: true } },
        academicYear: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  findMyRequests(user: AuthenticatedUser) {
    if (!user.student?.id) return [];
    return this.prisma.leaveRequest.findMany({
      where: { studentId: user.student.id },
      include: { academicYear: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  findOne(id: number) {
    return this.prisma.leaveRequest.findUnique({
      where: { id },
      include: {
        student: { include: { studyProgram: true, user: true } },
        academicYear: true
      }
    });
  }

  async update(id: number, updateLeaveRequestDto: UpdateLeaveRequestDto) {
    const request = await this.prisma.leaveRequest.findUnique({ where: { id } });
    if (!request) throw new NotFoundException('Leave request not found');

    const updated = await this.prisma.leaveRequest.update({
      where: { id },
      data: {
        status: updateLeaveRequestDto.status,
        adminNotes: updateLeaveRequestDto.adminNotes
      }
    });

    // If approved, update student status
    if (updateLeaveRequestDto.status === 'APPROVED') {
      await this.prisma.student.update({
        where: { id: request.studentId },
        data: { status: 'ON_LEAVE' }
      });
    } else if (updateLeaveRequestDto.status === 'REJECTED' || updateLeaveRequestDto.status === 'PENDING') {
      // Revert if somehow it was ON_LEAVE before? Usually we don't automatically revert to ACTIVE
      // unless we know for sure they should be active. For now, leave it.
    }

    return updated;
  }
}
