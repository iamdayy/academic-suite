// 📁 apps/api/src/lecturers/lecturers.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLecturerDto } from './dto/create-lecturer.dto';
import { UpdateLecturerDto } from './dto/update-lecturer.dto';

@Injectable()
export class LecturersService {
  // 1. Suntikkan (Inject) PrismaService
  constructor(private prisma: PrismaService) {}

  // 2. Definisikan data user yang ingin kita sertakan
  private lecturerInclude = {
    user: {
      select: {
        id: true,
        email: true,
        role: true,
      },
    },
  };

  create(createLecturerDto: CreateLecturerDto) {
    // Alur: Admin membuat 'User' dulu, lalu 'Lecturer'
    // dan menghubungkannya dengan 'userId'
    return this.prisma.lecturer.create({
      data: createLecturerDto,
      include: this.lecturerInclude,
    });
  }

  findAll() {
    return this.prisma.lecturer.findMany({
      include: this.lecturerInclude, // 3. Gunakan include
    });
  }

  async findOne(id: number) {
    const lecturer = await this.prisma.lecturer.findUnique({
      where: { id },
      include: this.lecturerInclude, // 4. Gunakan include
    });

    if (!lecturer) {
      throw new NotFoundException(`Lecturer with ID ${id} not found`);
    }
    return lecturer;
  }

  update(id: number, updateLecturerDto: UpdateLecturerDto) {
    return this.prisma.lecturer.update({
      where: { id },
      data: updateLecturerDto,
      include: this.lecturerInclude,
    });
  }

  async remove(id: number) {
    // Pastikan ada sebelum dihapus
    await this.findOne(id);
    return this.prisma.lecturer.delete({
      where: { id },
    });
  }
}
