import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateThesisDefenseDto } from './dto/create-thesis-defense.dto';
import { UpdateThesisDefenseDto } from './dto/update-thesis-defense.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ThesisDefensesService {
  constructor(private prisma: PrismaService) {}

  async create(createThesisDefenseDto: CreateThesisDefenseDto) {
    const defense = await this.prisma.thesisDefense.create({
      data: {
        thesisId: createThesisDefenseDto.thesisId,
        scheduledAt: new Date(createThesisDefenseDto.scheduledAt),
        facilityId: createThesisDefenseDto.facilityId,
        status: 'SCHEDULED',
        examiners: {
          create: createThesisDefenseDto.examinerIds?.map((id, index) => ({
            lecturerId: id,
            role: index === 0 ? 'PENGUJI_1' : 'PENGUJI_2',
          })) || []
        }
      },
      include: { examiners: true }
    });
    
    // Also update thesis status
    await this.prisma.thesis.update({
      where: { id: defense.thesisId },
      data: { status: 'ACTIVE' }
    });
    
    return defense;
  }

  findAll() {
    return this.prisma.thesisDefense.findMany({
      include: {
        thesis: { include: { student: true } },
        examiners: { include: { lecturer: true } },
        facility: true
      },
      orderBy: { scheduledAt: 'desc' }
    });
  }

  findOne(id: number) {
    return this.prisma.thesisDefense.findUnique({
      where: { id },
      include: {
        thesis: { include: { student: true } },
        examiners: { include: { lecturer: true } },
        facility: true
      }
    });
  }

  async update(id: number, updateThesisDefenseDto: UpdateThesisDefenseDto) {
    const defense = await this.prisma.thesisDefense.update({
      where: { id },
      data: {
        status: updateThesisDefenseDto.status,
        score: updateThesisDefenseDto.score,
        notes: updateThesisDefenseDto.notes,
      },
    });
    
    // If PASSED or FAILED, update thesis status
    if (updateThesisDefenseDto.status === 'PASSED') {
      await this.prisma.thesis.update({
        where: { id: defense.thesisId },
        data: { status: 'COMPLETED' }
      });
    } else if (updateThesisDefenseDto.status === 'FAILED') {
      // Logic for failed can be specific, but let's keep it ACTIVE for retake, or REJECTED.
    }
    
    return defense;
  }

  remove(id: number) {
    return this.prisma.thesisDefense.delete({
      where: { id },
    });
  }
}
