// 📁 apps/api/src/students/students.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentsService {
  // 1. Suntikkan (Inject) PrismaService
  constructor(private prisma: PrismaService) {}

  // 2. Definisikan data yang ingin kita sertakan
  private studentInclude = {
    user: {
      select: {
        id: true,
        email: true,
        role: true,
      },
    },
    studyProgram: {
      include: {
        major: true, // Sertakan juga data Jurusan
      },
    },
  };

  create(createStudentDto: CreateStudentDto) {
    // Alur: Admin membuat 'User' dulu, lalu 'Student'
    // dan menghubungkannya dengan 'userId' dan 'studyProgramId'
    return this.prisma.student.create({
      data: createStudentDto,
      include: this.studentInclude,
    });
  }

  findAll() {
    return this.prisma.student.findMany({
      include: this.studentInclude, // 3. Gunakan include
    });
  }

  async findOne(id: number) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: this.studentInclude, // 4. Gunakan include
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }
    return student;
  }

  update(id: number, updateStudentDto: UpdateStudentDto) {
    return this.prisma.student.update({
      where: { id },
      data: updateStudentDto,
      include: this.studentInclude,
    });
  }

  async remove(id: number) {
    // Pastikan ada sebelum dihapus
    await this.findOne(id);
    return this.prisma.student.delete({
      where: { id },
    });
  }
}
