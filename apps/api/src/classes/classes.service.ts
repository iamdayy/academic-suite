// 📁 apps/api/src/classes/classes.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuthenticatedUser } from 'shared-types';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';

@Injectable()
export class ClassesService {
  // 1. Suntikkan (Inject) PrismaService
  constructor(private prisma: PrismaService) {}

  // 2. Definisikan data yang ingin kita sertakan
  private classInclude = {
    course: true, // Data mata kuliah
    lecturer: true, // Data profil dosen (NIDN, Nama)
    academicYear: true, // Data tahun ajaran
  };

  create(createClassDto: CreateClassDto) {
    return this.prisma.class.create({
      data: createClassDto,
      include: this.classInclude,
    });
  }

  findAll(curriculumId?: number, academicYearId?: number) {
    // <-- Tambah academicYearId
    const whereClause: Prisma.ClassWhereInput = {}; // <-- Gunakan tipe Prisma

    if (curriculumId) {
      whereClause.course = { curriculumId: curriculumId };
    }

    if (academicYearId) {
      whereClause.academicYearId = academicYearId; // <-- Tambah filter baru
    }

    return this.prisma.class.findMany({
      where: whereClause, // Gunakan klausa
      include: this.classInclude,
    });
  }

  /**
   * [BARU] [UNTUK DOSEN]
   * Menampilkan semua kelas yang diajar oleh dosen yang login.
   */
  async findMyClasses(user: AuthenticatedUser) {
    // 1. Pastikan user adalah Dosen
    if (!user.lecturer) {
      throw new Error('User is not a lecturer');
    }
    const lecturerId = user.lecturer.id;

    // 2. Cari semua kelas yang diajar oleh ID dosen ini
    return this.prisma.class.findMany({
      where: {
        lecturerId: lecturerId,
      },
      include: this.classInclude, // Gunakan include yang sudah ada
      orderBy: {
        academicYear: {
          startDate: 'desc',
        },
      },
    });
  }

  async findOne(id: number) {
    const classInstance = await this.prisma.class.findUnique({
      where: { id },
      include: this.classInclude,
    });

    if (!classInstance) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }
    return classInstance;
  }

  update(id: number, updateClassDto: UpdateClassDto) {
    return this.prisma.class.update({
      where: { id },
      data: updateClassDto,
      include: this.classInclude,
    });
  }

  async remove(id: number) {
    // Pastikan ada sebelum dihapus
    await this.findOne(id);
    return this.prisma.class.delete({
      where: { id },
    });
  }
}
