import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  private userSelect = {
    id: true,
    email: true,
    createdAt: true,
    updatedAt: true,
    role: {
      select: {
        roleName: true,
        id: true,
      },
    },
    student: {
      select: {
        nim: true,
        name: true,
      },
    },
    lecturer: {
      select: {
        nidn: true,
        name: true,
      },
    },
    guardian: {
      select: {
        name: true,
      },
    },
  };

  async create(createUserDto: CreateUserDto) {
    try {
      const user = {
        email: createUserDto.email,
        password: await bcrypt.hash(createUserDto.password, 10),
        roleId: createUserDto.roleId,
      };
      const created = await this.prisma.user.create({ data: user });
      if (created) {
        return {
          status: 200,
          message: 'User created successfully',
          // data: created,
        };
      }
    } catch (error) {
      return {
        status: 400,
        message: 'Failed to create user',
        data: error as unknown,
      };
    }
  }

  async findAll() {
    try {
      const users = await this.prisma.user.findMany({
        select: this.userSelect,
      });
      return users;
    } catch (error) {
      return {
        status: 400,
        message: 'Failed to fetch users',
        data: error as unknown,
      };
    }
  }

  async findOne(id: number) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id } });
      return {
        status: 200,
        message: 'User fetched successfully',
        data: user,
      };
    } catch (error) {
      return {
        status: 400,
        message: 'Failed to fetch user',
        data: error as unknown,
      };
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    try {
      const updated = await this.prisma.user.update({
        where: { id },
        data: updateUserDto,
      });
      return {
        status: 200,
        message: 'User updated successfully',
        data: updated,
      };
    } catch (error) {
      return {
        status: 400,
        message: 'Failed to update user',
        data: error as unknown,
      };
    }
  }

  async remove(id: number) {
    try {
      const deleted = await this.prisma.user.delete({ where: { id } });
      return {
        status: 200,
        message: 'User deleted successfully',
        data: deleted,
      };
    } catch (error) {
      return {
        status: 400,
        message: 'Failed to delete user',
        data: error as unknown,
      };
    }
  }
  async findOneByEmail(email: string) {
    // Tidak seperti 'findOne', kita INGIN mengembalikan password
    // agar AuthService bisa membandingkannya
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }
    return user; // Kembalikan user LENGKAP (termasuk password)
  }
  async findForAuth(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        role: true, // Ambil objek role lengkap
        student: true, // Ambil profil student (jika ada)
        lecturer: true, // Ambil profil lecturer (jika ada)
        guardian: true, // Ambil profil guardian (jika ada)
      },
    });

    if (!user) {
      return null;
    }
    return user; // Kembalikan LENGKAP (termasuk password)
  }

  /**
   * Mengambil profil lengkap user berdasarkan ID untuk JWT Strategy.
   * TIDAK termasuk password.
   */
  async findProfileById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
        student: true,
        lecturer: true,
        guardian: true,
      },
    });
    if (!user) {
      return {
        status: 404,
        message: 'User not found',
      };
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }
}
