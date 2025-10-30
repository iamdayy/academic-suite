// 📁 apps/api/src/courses/courses.service.ts

import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddPrerequisiteDto } from './dto/add-prerequisite.dto';
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

  findAll(curriculumId?: number) {
    // Tambahkan parameter opsional
    const whereClause = curriculumId ? { curriculumId } : {};

    return this.prisma.course.findMany({
      where: whereClause, // Gunakan klausa
      include: this.courseInclude,
    });
  }

  async findOne(id: number) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        ...this.courseInclude, // 3. Gunakan include
        prerequisites: {
          include: {
            prerequisiteCourse: true,
          },
        },
      }, // 4. Gunakan include
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
  /**
   * [BARU] [UNTUK ADMIN]
   * Menambahkan prasyarat ke sebuah mata kuliah.
   */
  async addPrerequisite(courseId: number, dto: AddPrerequisiteDto) {
    const { prerequisiteCourseId } = dto;

    // 1. Validasi kedua mata kuliah ada
    const course = await this.findOne(courseId);
    const prerequisiteCourse = await this.findOne(prerequisiteCourseId);

    // 2. Cek apakah sudah ada
    const existing = await this.prisma.prerequisite.findFirst({
      where: {
        courseId: course.id,
        prerequisiteCourseId: prerequisiteCourse.id,
      },
    });

    if (existing) {
      throw new ConflictException(
        'This prerequisite connection already exists',
      );
    }

    // 3. Buat koneksi prasyarat
    return this.prisma.prerequisite.create({
      data: {
        courseId: course.id,
        prerequisiteCourseId: prerequisiteCourse.id,
      },
    });
  }
}
