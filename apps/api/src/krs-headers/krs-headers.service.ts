// 📁 apps/api/src/krs-headers/krs-headers.service.ts

import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Student, User } from '@prisma/client';
import { Role } from 'shared-types';
import { PrismaService } from '../prisma/prisma.service';
import { CreateKrsHeaderDto } from './dto/create-krs-header.dto';
import { UpdateKrsHeaderDto } from './dto/update-krs-header.dto';

// Tipe 'User' dari Prisma yang kita dapatkan dari req.user (setelah di-select)
type AuthenticatedUser = Partial<User> & {
  student?: Student;
  role: { roleName: Role };
};

@Injectable()
export class KrsHeadersService {
  constructor(private prisma: PrismaService) {}

  // Definisikan 'include' untuk dipakai ulang
  private krsHeaderInclude = {
    student: {
      include: {
        user: { select: { email: true } }, // Data user student
        studyProgram: true, // Data prodi student
      },
    },
    academicYear: true, // Data tahun ajaran
    krsDetails: {
      // Data mata kuliah yang diambil
      include: {
        course: true,
      },
    },
  };

  /**
   * [UNTUK STUDENT]
   * Membuat KrsHeader baru atas nama student yang sedang login
   */
  async create(
    createKrsHeaderDto: CreateKrsHeaderDto,
    user: AuthenticatedUser,
  ) {
    // 1. Pastikan user yang login adalah STUDENT dan punya profil
    if (!user.student) {
      throw new UnauthorizedException('User is not a student');
    }
    const studentId = user.student.id;

    // 2. Buat KrsHeader
    return this.prisma.krsHeader.create({
      data: {
        ...createKrsHeaderDto,
        studentId: studentId, // Ambil dari token
        status: 'DRAFT', // Status default
      },
      include: this.krsHeaderInclude,
    });
  }

  /**
   * [UNTUK STUDENT]
   * Menampilkan semua KRS milik student yang sedang login
   */
  async findMyHeaders(user: AuthenticatedUser) {
    if (!user.student) {
      throw new UnauthorizedException('User is not a student');
    }
    const studentId = user.student.id;

    return this.prisma.krsHeader.findMany({
      where: { studentId },
      include: this.krsHeaderInclude,
      orderBy: { academicYear: { startDate: 'desc' } },
    });
  }

  /**
   * [UNTUK STUDENT & ADMIN]
   * Menampilkan satu KRS spesifik.
   * Student hanya bisa melihat miliknya, Admin bisa melihat semua.
   */
  async findOne(id: number, user: AuthenticatedUser) {
    const krsHeader = await this.prisma.krsHeader.findUnique({
      where: { id },
      include: this.krsHeaderInclude,
    });

    if (!krsHeader) {
      throw new NotFoundException(`KRS Header with ID ${id} not found`);
    }

    // 4. Logika Keamanan:
    // Jika user adalah ADMIN, izinkan.
    if (user.role.roleName === Role.ADMIN) {
      return krsHeader;
    }

    // Jika user adalah STUDENT, cek kepemilikan.
    if (user.student && krsHeader.studentId === user.student.id) {
      return krsHeader;
    }

    // Jika tidak keduanya, tolak akses
    throw new UnauthorizedException('You do not own this resource');
  }

  /**
   * [UNTUK ADMIN]
   * Menampilkan semua KRS dari semua student (untuk approval)
   */
  findAll() {
    return this.prisma.krsHeader.findMany({
      include: this.krsHeaderInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * [UNTUK ADMIN]
   * Mengubah status KRS (misal: APPROVED / REJECTED)
   */
  update(id: number, updateKrsHeaderDto: UpdateKrsHeaderDto) {
    return this.prisma.krsHeader.update({
      where: { id },
      data: updateKrsHeaderDto,
      include: this.krsHeaderInclude,
    });
  }

  /**
   * [UNTUK ADMIN]
   * Menghapus KRS
   */
  async remove(id: number) {
    await this.findOne(id, { role: { roleName: Role.ADMIN } });
    return this.prisma.krsHeader.delete({ where: { id } });
  }
}
