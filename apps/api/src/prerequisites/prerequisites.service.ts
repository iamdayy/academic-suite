// 📁 apps/api/src/prerequisites/prerequisites.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrerequisitesService {
  constructor(private prisma: PrismaService) {}

  async remove(id: number) {
    const prerequisite = await this.prisma.prerequisite.findUnique({
      where: { id },
    });
    if (!prerequisite) {
      throw new NotFoundException(`Prerequisite with ID ${id} not found`);
    }
    return this.prisma.prerequisite.delete({ where: { id } });
  }
}
