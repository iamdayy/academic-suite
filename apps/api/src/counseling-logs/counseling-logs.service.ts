import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCounselingLogDto } from './dto/create-counseling-log.dto';
import { UpdateCounselingLogDto } from './dto/update-counseling-log.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CounselingLogsService {
  constructor(private prisma: PrismaService) {}

  create(createCounselingLogDto: CreateCounselingLogDto) {
    return this.prisma.counselingLog.create({
      data: {
        thesisId: createCounselingLogDto.thesisId,
        lecturerId: createCounselingLogDto.lecturerId,
        date: new Date(createCounselingLogDto.date),
        notes: createCounselingLogDto.notes,
        status: 'PENDING',
      },
      include: {
        lecturer: true,
      }
    });
  }

  findAll() {
    return this.prisma.counselingLog.findMany({
      include: {
        thesis: { include: { student: true } },
        lecturer: true,
      },
      orderBy: { date: 'desc' }
    });
  }

  findOne(id: number) {
    return this.prisma.counselingLog.findUnique({
      where: { id },
      include: {
        thesis: true,
        lecturer: true,
      }
    });
  }

  update(id: number, updateCounselingLogDto: UpdateCounselingLogDto) {
    return this.prisma.counselingLog.update({
      where: { id },
      data: {
        status: updateCounselingLogDto.status,
      },
    });
  }

  remove(id: number) {
    return this.prisma.counselingLog.delete({
      where: { id },
    });
  }
}
