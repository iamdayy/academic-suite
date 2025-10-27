// 📁 apps/api/src/courses/courses.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CoursesService {
  // 1. Suntikkan (Inject) PrismaService
  constructor(private prisma: PrismaService) {}

  // 2. Definisikan include bertingkat untuk dipakai ulang
  private courseInclude = {
    curriculum: {
      include: {
        studyProgram: {
          include: {
            major: true,
          },
        },
      },
    },
  };

  create(createCourseDto: CreateCourseDto) {
    return this.prisma.course.create({
      data: createCourseDto,
    });
  }

  findAll() {
    return this.prisma.course.findMany({
      include: this.courseInclude, // 3. Gunakan include
    });
  }

  async findOne(id: number) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: this.courseInclude, // 4. Gunakan include
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    return course;
  }

  update(id: number, updateCourseDto: UpdateCourseDto) {
    return this.prisma.course.update({
      where: { id },
      data: updateCourseDto,
    });
  }

  async remove(id: number) {
    // Pastikan ada sebelum dihapus
    await this.findOne(id);
    return this.prisma.course.delete({
      where: { id },
    });
  }
}
