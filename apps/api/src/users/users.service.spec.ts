// 📁 apps/api/src/users/users.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  // 1. Suntikkan (Inject) PrismaService
  constructor(private prisma: PrismaService) {}

  // Definisikan 'select' untuk keamanan
  // Kita TIDAK PERNAH ingin mengembalikan password hash
  private userSelect = {
    id: true,
    email: true,
    roleId: true,
    createdAt: true,
    updatedAt: true,
    // Kita tidak memasukkan 'password'
  };

  async create(createUserDto: CreateUserDto) {
    // 2. Hash password sebelum disimpan
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

    // 3. Gunakan Prisma Client untuk membuat user baru
    return this.prisma.user.create({
      data: {
        email: createUserDto.email,
        password: hashedPassword,
        roleId: createUserDto.roleId,
      },
      select: this.userSelect, // Hanya kembalikan data yang aman
    });
  }

  async findAll() {
    // 4. Temukan semua user
    return this.prisma.user.findMany({
      select: this.userSelect,
    });
  }

  async findOne(id: number) {
    // 5. Temukan satu user berdasarkan ID
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: this.userSelect,
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    // 6. Jika password di-update, hash password baru
    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt();
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, salt);
    }

    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: this.userSelect,
    });
  }

  async remove(id: number) {
    // 7. Hapus user
    // Pastikan user ada sebelum dihapus untuk data return
    const user = await this.findOne(id);
    await this.prisma.user.delete({
      where: { id },
    });
    return user; // Kembalikan data user yang dihapus
  }
}
