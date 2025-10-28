// 📁 apps/api/src/materials/materials.service.ts

import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthenticatedUser } from 'shared-types';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';

@Injectable()
export class MaterialsService {
  constructor(private prisma: PrismaService) {}

  /**
   * [PRIVATE] Helper untuk memverifikasi apakah Dosen
   * adalah pemilik (pengajar) dari kelas tersebut.
   */
  private async verifyClassOwnership(classId: bigint, user: AuthenticatedUser) {
    // 1. Pastikan user adalah Dosen dan punya profil
    if (!user.lecturer) {
      throw new UnauthorizedException('User is not a lecturer');
    }
    const lecturerId = user.lecturer.id;

    // 2. Cari kelas
    const classInstance = await this.prisma.class.findUnique({
      where: { id: classId },
    });

    if (!classInstance) {
      throw new NotFoundException(`Class with ID ${classId} not found`);
    }

    // 3. Bandingkan ID Dosen
    if (classInstance.lecturerId !== lecturerId) {
      throw new UnauthorizedException('You do not own this class');
    }

    return classInstance; // Kembalikan data kelas jika berhasil
  }

  /**
   * [UNTUK DOSEN]
   * Membuat materi baru untuk kelas yang diajarnya.
   */
  async create(createMaterialDto: CreateMaterialDto, user: AuthenticatedUser) {
    const { classId } = createMaterialDto;

    // 1. Verifikasi kepemilikan kelas terlebih dahulu
    await this.verifyClassOwnership(classId, user);

    // 2. Buat materi
    return this.prisma.material.create({
      data: createMaterialDto,
    });
  }

  /**
   * [UNTUK SEMUA ROLE LOGIN]
   * Menampilkan semua materi untuk satu kelas.
   */
  findAllByClass(classId: number) {
    return this.prisma.material.findMany({
      where: { classId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * [UNTUK SEMUA ROLE LOGIN]
   * Menampilkan satu materi spesifik.
   */
  async findOne(id: number) {
    const material = await this.prisma.material.findUnique({
      where: { id },
    });

    if (!material) {
      throw new NotFoundException(`Material with ID ${id} not found`);
    }
    return material;
  }

  /**
   * [UNTUK DOSEN]
   * Mengupdate materi.
   */
  async update(
    id: number,
    updateMaterialDto: UpdateMaterialDto,
    user: AuthenticatedUser,
  ) {
    // 1. Dapatkan materi
    const material = await this.findOne(id);

    // 2. Verifikasi kepemilikan kelas dari materi tersebut
    await this.verifyClassOwnership(material.classId, user);

    // 3. Update materi
    return this.prisma.material.update({
      where: { id },
      data: updateMaterialDto,
    });
  }

  /**
   * [UNTUK DOSEN]
   * Menghapus materi.
   */
  async remove(id: number, user: AuthenticatedUser) {
    // 1. Dapatkan materi
    const material = await this.findOne(id);

    // 2. Verifikasi kepemilikan kelas dari materi tersebut
    await this.verifyClassOwnership(material.classId, user);

    // 3. Hapus materi
    return this.prisma.material.delete({
      where: { id },
    });
  }
}
