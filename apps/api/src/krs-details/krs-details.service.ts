// 📁 apps/api/src/krs-details/krs-details.service.ts

import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthenticatedUser } from 'shared-types';
import { PrismaService } from '../prisma/prisma.service';
import { CreateKrsDetailDto } from './dto/create-krs-detail.dto';

@Injectable()
export class KrsDetailsService {
  constructor(private prisma: PrismaService) {}

  /**
   * [UNTUK STUDENT]
   * Menambahkan mata kuliah (course) ke KrsHeader.
   */
  async create(
    createKrsDetailDto: CreateKrsDetailDto,
    user: AuthenticatedUser,
  ) {
    const { krsHeaderId, courseId } = createKrsDetailDto;

    // 1. Dapatkan KrsHeader
    const krsHeader = await this.prisma.krsHeader.findUnique({
      where: { id: krsHeaderId },
    });

    if (!krsHeader) {
      throw new NotFoundException('KRS Header not found');
    }

    // 2. Verifikasi Kepemilikan (Sangat Penting!)
    if (krsHeader.studentId !== user.student?.id) {
      throw new UnauthorizedException('You do not own this KRS Header');
    }

    // 3. (Opsional) Cek apakah mata kuliah sudah ada
    const existingDetail = await this.prisma.krsDetail.findFirst({
      where: { krsHeaderId, courseId },
    });

    if (existingDetail) {
      throw new ConflictException('Course already added to this KRS');
    }

    // 4. Buat KrsDetail
    return this.prisma.krsDetail.create({
      data: {
        krsHeaderId,
        courseId,
      },
      include: {
        course: true, // Sertakan data mata kuliah yang baru ditambahkan
      },
    });
  }

  // Kita tidak butuh findAll() atau findOne() di sini,
  // karena detail sudah diambil melalui KrsHeadersService

  /**
   * [UNTUK STUDENT]
   * Menghapus mata kuliah dari KrsHeader.
   */
  async remove(id: number, user: AuthenticatedUser) {
    // 1. Dapatkan KrsDetail
    const krsDetail = await this.prisma.krsDetail.findUnique({
      where: { id },
      include: {
        krsHeader: true, // Kita butuh data header untuk cek kepemilikan
      },
    });

    if (!krsDetail) {
      throw new NotFoundException('KRS Detail not found');
    }

    // 2. Verifikasi Kepemilikan
    if (krsDetail.krsHeader.studentId !== user.student?.id) {
      throw new UnauthorizedException('You do not own this resource');
    }

    // 3. Hapus
    return this.prisma.krsDetail.delete({
      where: { id },
    });
  }
}
