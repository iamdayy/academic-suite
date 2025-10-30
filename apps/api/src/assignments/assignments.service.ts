// 📁 apps/api/src/assignments/assignments.service.ts

import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthenticatedUser } from 'shared-types';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';

@Injectable()
export class AssignmentsService {
  constructor(private prisma: PrismaService) {}

  /**
   * [PRIVATE] Helper verifikasi kepemilikan kelas.
   * (Ini adalah kode yang sama persis dari MaterialsService)
   */
  private async verifyClassOwnership(classId: bigint, user: AuthenticatedUser) {
    if (!user.lecturer) {
      throw new UnauthorizedException('User is not a lecturer');
    }
    const lecturerId = user.lecturer.id;

    const classInstance = await this.prisma.class.findUnique({
      where: { id: classId },
    });

    if (!classInstance) {
      throw new NotFoundException(`Class with ID ${classId} not found`);
    }

    if (classInstance.lecturerId !== lecturerId) {
      throw new UnauthorizedException('You do not own this class');
    }

    return classInstance;
  }

  /**
   * [UNTUK DOSEN]
   * Membuat tugas baru untuk kelas yang diajarnya.
   */
  async create(
    createAssignmentDto: CreateAssignmentDto,
    user: AuthenticatedUser,
  ) {
    const { classId } = createAssignmentDto;

    // 1. Verifikasi kepemilikan kelas
    await this.verifyClassOwnership(classId, user);

    // 2. Buat tugas
    return this.prisma.assignment.create({
      data: createAssignmentDto,
    });
  }

  /**
   * [UNTUK SEMUA ROLE LOGIN]
   * Menampilkan semua tugas untuk satu kelas.
   */
  findAllByClass(classId: number) {
    return this.prisma.assignment.findMany({
      where: { classId },
      orderBy: { deadline: 'asc' },
    });
  }

  /**
   * [UNTUK SEMUA ROLE LOGIN]
   * Menampilkan satu tugas spesifik.
   */
  async findOne(id: number) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id },
    });

    if (!assignment) {
      throw new NotFoundException(`Assignment with ID ${id} not found`);
    }
    return assignment;
  }

  /**
   * [UNTUK DOSEN]
   * Mengupdate tugas.
   */
  async update(
    id: number,
    updateAssignmentDto: UpdateAssignmentDto,
    user: AuthenticatedUser,
  ) {
    const assignment = await this.findOne(id);
    await this.verifyClassOwnership(assignment.classId, user);

    return this.prisma.assignment.update({
      where: { id },
      data: updateAssignmentDto,
    });
  }

  /**
   * [UNTUK DOSEN]
   * Menghapus tugas.
   */
  async remove(id: number, user: AuthenticatedUser) {
    const assignment = await this.findOne(id);
    await this.verifyClassOwnership(assignment.classId, user);

    return this.prisma.assignment.delete({
      where: { id },
    });
  }

  /**
   * [BARU] [UNTUK STUDENT]
   * Menampilkan semua tugas dari semua kelas yang diikuti.
   */
  async findMyAssignments(user: AuthenticatedUser) {
    // 1. Pastikan user adalah Student
    if (!user.student) {
      throw new UnauthorizedException('User is not a student');
    }
    const studentId = user.student.id;

    // 2. Dapatkan semua ID kelas yang diikuti student
    const enrollments = await this.prisma.classStudent.findMany({
      where: { studentId: studentId },
      select: { classId: true }, // Hanya butuh ID kelas
    });

    // Ubah [ { classId: 1 }, { classId: 2 } ] menjadi [ 1, 2 ]
    const classIds = enrollments.map((en) => en.classId);

    // 3. Dapatkan semua tugas dari daftar kelas tersebut
    return this.prisma.assignment.findMany({
      where: {
        classId: {
          in: classIds, // Filter: 'dimana classId ada di dalam array classIds'
        },
      },
      include: {
        class: true, // Sertakan data kelas agar tahu ini tugas apa
        submissions: {
          where: {
            studentId: studentId,
          },
        },
      },
      orderBy: {
        deadline: 'asc',
      },
    });
  }
}
