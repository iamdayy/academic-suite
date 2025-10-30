// 📁 apps/api/src/guardians/guardians.service.ts
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConnectStudentDto } from './dto/connect-student.dto';
import { CreateGuardianDto } from './dto/create-guardian.dto';
import { UpdateGuardianDto } from './dto/update-guardian.dto';

@Injectable()
export class GuardiansService {
  constructor(private prisma: PrismaService) {}

  private guardianInclude = {
    user: {
      select: {
        id: true,
        email: true,
        role: true,
      },
    },
    // Relasi ke students (anak)
    students: {
      include: {
        student: true,
      },
    },
  };

  create(createGuardianDto: CreateGuardianDto) {
    return this.prisma.guardian.create({
      data: createGuardianDto,
      include: this.guardianInclude,
    });
  }

  findAll() {
    return this.prisma.guardian.findMany({
      include: this.guardianInclude,
    });
  }

  async findOne(id: number) {
    const guardian = await this.prisma.guardian.findUnique({
      where: { id },
      include: this.guardianInclude,
    });
    if (!guardian) {
      throw new NotFoundException(`Guardian with ID ${id} not found`);
    }
    return guardian;
  }

  update(id: number, updateGuardianDto: UpdateGuardianDto) {
    return this.prisma.guardian.update({
      where: { id },
      data: updateGuardianDto,
      include: this.guardianInclude,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.guardian.delete({ where: { id } });
  }

  /**
   * [BARU] [UNTUK ADMIN]
   * Menghubungkan seorang Wali ke seorang Mahasiswa.
   */
  async connectStudent(guardianId: number, connectDto: ConnectStudentDto) {
    const { studentId } = connectDto;

    // 1. Cek apakah guardian dan student ada
    await this.findOne(guardianId); // Cek guardian
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
    });
    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    // 2. Cek apakah koneksi sudah ada
    const existingConnection = await this.prisma.guardianStudent.findFirst({
      where: {
        guardianId: guardianId,
        studentId: studentId,
      },
    });

    if (existingConnection) {
      throw new ConflictException(
        'This student is already connected to this guardian',
      );
    }

    // 3. Buat koneksi di tabel pivot
    return this.prisma.guardianStudent.create({
      data: {
        guardianId: guardianId,
        studentId: studentId,
      },
    });
  }
}
