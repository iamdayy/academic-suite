// 📁 apps/api/src/academic-years/academic-years.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAcademicYearDto } from './dto/create-academic-year.dto';
import { UpdateAcademicYearDto } from './dto/update-academic-year.dto';

@Injectable()
export class AcademicYearsService {
  // 1. Suntikkan (Inject) PrismaService
  constructor(private prisma: PrismaService) {}

  create(createAcademicYearDto: CreateAcademicYearDto) {
    return this.prisma.academicYear.create({
      data: createAcademicYearDto,
    });
  }

  findAll() {
    return this.prisma.academicYear.findMany({
      orderBy: {
        startDate: 'desc', // Tampilkan yang terbaru di atas
      },
    });
  }

  async findOne(id: number) {
    const academicYear = await this.prisma.academicYear.findUnique({
      where: { id },
    });

    if (!academicYear) {
      throw new NotFoundException(`Academic Year with ID ${id} not found`);
    }
    return academicYear;
  }

  update(id: number, updateAcademicYearDto: UpdateAcademicYearDto) {
    return this.prisma.academicYear.update({
      where: { id },
      data: updateAcademicYearDto,
    });
  }

  async remove(id: number) {
    // Pastikan ada sebelum dihapus
    await this.findOne(id);
    return this.prisma.academicYear.delete({
      where: { id },
    });
  }
}
