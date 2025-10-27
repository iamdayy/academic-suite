// 📁 apps/api/src/study-programs/study-programs.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudyProgramDto } from './dto/create-study-program.dto';
import { UpdateStudyProgramDto } from './dto/update-study-program.dto';

@Injectable()
export class StudyProgramsService {
  // 1. Suntikkan (Inject) PrismaService
  constructor(private prisma: PrismaService) {}

  create(createStudyProgramDto: CreateStudyProgramDto) {
    // Prisma akan otomatis menghubungkan 'majorId'
    return this.prisma.studyProgram.create({
      data: createStudyProgramDto,
    });
  }

  findAll() {
    return this.prisma.studyProgram.findMany({
      // 2. Kita sertakan data 'major' agar informatif
      include: {
        major: true,
      },
    });
  }

  async findOne(id: number) {
    const studyProgram = await this.prisma.studyProgram.findUnique({
      where: { id },
      include: {
        major: true,
      },
    });

    if (!studyProgram) {
      throw new NotFoundException(`Study Program with ID ${id} not found`);
    }
    return studyProgram;
  }

  update(id: number, updateStudyProgramDto: UpdateStudyProgramDto) {
    return this.prisma.studyProgram.update({
      where: { id },
      data: updateStudyProgramDto,
    });
  }

  async remove(id: number) {
    // Pastikan ada sebelum dihapus
    await this.findOne(id);
    return this.prisma.studyProgram.delete({
      where: { id },
    });
  }
}
