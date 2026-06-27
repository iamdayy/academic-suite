import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateThesisDto } from './dto/create-thesis.dto';
import { UpdateThesisDto } from './dto/update-thesis.dto';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedUser } from 'shared-types';

@Injectable()
export class ThesesService {
  constructor(private prisma: PrismaService) {}

  async create(createThesisDto: CreateThesisDto, user: AuthenticatedUser) {
    if (!user.student?.id) {
      throw new BadRequestException('User is not a student');
    }
    
    // Check if student already has a thesis
    const existing = await this.prisma.thesis.findUnique({
      where: { studentId: user.student.id }
    });
    if (existing) {
      throw new BadRequestException('You already have a thesis record');
    }

    return this.prisma.thesis.create({
      data: {
        studentId: user.student.id,
        title: createThesisDto.title,
        abstract: createThesisDto.abstract,
        status: 'PROPOSED',
        supervisors: {
          create: createThesisDto.proposedSupervisorIds?.map((id, index) => ({
            lecturerId: id,
            role: index === 0 ? 'PEMBIMBING_1' : 'PEMBIMBING_2',
            status: 'PENDING'
          })) || []
        }
      },
      include: { supervisors: true }
    });
  }

  findAll() {
    return this.prisma.thesis.findMany({
      include: {
        student: { include: { studyProgram: true } },
        supervisors: { include: { lecturer: true } },
        defense: true,
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  findMyThesis(user: AuthenticatedUser) {
    if (!user.student?.id) return null;
    return this.prisma.thesis.findUnique({
      where: { studentId: user.student.id },
      include: {
        supervisors: { include: { lecturer: true } },
        counselingLogs: { include: { lecturer: true }, orderBy: { date: 'desc' } },
        defense: { include: { examiners: { include: { lecturer: true } } } }
      }
    });
  }

  findOne(id: number) {
    return this.prisma.thesis.findUnique({
      where: { id },
      include: {
        student: true,
        supervisors: { include: { lecturer: true } },
        defense: { include: { examiners: { include: { lecturer: true } } } },
        counselingLogs: true
      }
    });
  }

  async update(id: number, updateThesisDto: UpdateThesisDto) {
    const thesis = await this.prisma.thesis.update({
      where: { id },
      data: {
        title: updateThesisDto.title,
        abstract: updateThesisDto.abstract,
        status: updateThesisDto.status,
      },
    });
    
    // Handle supervisors approval if provided
    if (updateThesisDto.supervisorApprovals) {
       for (const approval of updateThesisDto.supervisorApprovals) {
         await this.prisma.thesisSupervisor.update({
           where: { id: approval.supervisorId },
           data: { status: approval.status }
         });
       }
    }
    
    return this.findOne(id);
  }

  remove(id: number) {
    return this.prisma.thesis.delete({
      where: { id },
    });
  }
}
