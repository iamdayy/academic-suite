// 📁 apps/api/src/curriculums/curriculums.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCurriculumDto } from './dto/create-curriculum.dto';
import { UpdateCurriculumDto } from './dto/update-curriculum.dto';

@Injectable()
export class CurriculumsService {
  // 1. Suntikkan (Inject) PrismaService
  constructor(private prisma: PrismaService) {}

  create(createCurriculumDto: CreateCurriculumDto) {
    return this.prisma.curriculum.create({
      data: createCurriculumDto,
    });
  }

  findAll() {
    return this.prisma.curriculum.findMany({
      // 2. Kita sertakan data 'studyProgram'
      include: {
        studyProgram: true,
      },
    });
  }

  async findOne(id: number) {
    const curriculum = await this.prisma.curriculum.findUnique({
      where: { id },
      include: {
        studyProgram: true,
      },
    });

    if (!curriculum) {
      throw new NotFoundException(`Curriculum with ID ${id} not found`);
    }
    return curriculum;
  }

  update(id: number, updateCurriculumDto: UpdateCurriculumDto) {
    return this.prisma.curriculum.update({
      where: { id },
      data: updateCurriculumDto,
    });
  }

  async remove(id: number) {
    // Pastikan ada sebelum dihapus
    await this.findOne(id);
    return this.prisma.curriculum.delete({
      where: { id },
    });
  }
}
