import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMajorDto } from './dto/create-major.dto';
import { UpdateMajorDto } from './dto/update-major.dto';

@Injectable()
export class MajorsService {
  // 1. Suntikkan (Inject) PrismaService
  constructor(private prisma: PrismaService) {}

  create(createMajorDto: CreateMajorDto) {
    return this.prisma.major.create({
      data: createMajorDto,
    });
  }

  findAll() {
    return this.prisma.major.findMany();
  }

  async findOne(id: number) {
    const major = await this.prisma.major.findUnique({
      where: { id },
    });
    if (!major) {
      throw new NotFoundException(`Major with ID ${id} not found`);
    }
    return major;
  }

  update(id: number, updateMajorDto: UpdateMajorDto) {
    return this.prisma.major.update({
      where: { id },
      data: updateMajorDto,
    });
  }

  async remove(id: number) {
    // Pastikan ada sebelum dihapus
    await this.findOne(id);
    return this.prisma.major.delete({
      where: { id },
    });
  }
}
