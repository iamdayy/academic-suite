// 📁 apps/api/src/courses/courses.service.ts

import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthenticatedUser } from 'shared-types';
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

  /**
   * [UNTUK MAHASISWA]
   * Menampilkan semua mata kuliah yang tersedia di kurikulum aktif mahasiswa.
   */
  async findAvailableCourses(user: AuthenticatedUser) {
    // 1. Pastikan user adalah Mahasiswa
    if (!user.student) {
      throw new UnauthorizedException('User is not a student');
    }

    // 2. Dapatkan studyProgramId dari profil mahasiswa
    const studentProfile = await this.prisma.student.findUnique({
      where: { id: user.student.id },
      select: { studyProgramId: true },
    });

    if (!studentProfile) {
      throw new NotFoundException('Student profile not found');
    }

    // 3. Cari kurikulum terbaru (aktif) untuk prodi tersebut
    const activeCurriculum = await this.prisma.curriculum.findFirst({
      where: { studyProgramId: studentProfile.studyProgramId },
      orderBy: { year: 'desc' }, // Asumsi kurikulum tahun terbaru adalah yang aktif
    });

    if (!activeCurriculum) {
      // Jika prodi ini belum punya kurikulum, kembalikan array kosong
      return [];
    }

    // 4. Kembalikan semua mata kuliah dari kurikulum tersebut
    return this.prisma.course.findMany({
      where: {
        curriculumId: activeCurriculum.id,
      },
      orderBy: {
        semester: 'asc', // Urutkan berdasarkan semester
      },
    });
  }
}
