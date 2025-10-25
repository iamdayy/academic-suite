import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

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
      const users = await this.prisma.user.findMany();
      return {
        status: 200,
        message: 'Users fetched successfully',
        data: users,
      };
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
}
