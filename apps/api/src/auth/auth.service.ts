import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import { AuthenticatedUser, Role } from 'shared-types';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { RegisterStudentDto } from './dto/register-student.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  /**
   * Dipanggil oleh LocalStrategy untuk memvalidasi user
   */
  async validateUser(
    email: string,
    pass: string,
  ): Promise<Omit<User, 'password'> | null> {
    // 1. Temukan user berdasarkan email.
    // Kita butuh 'findOneByEmail' di UsersService (akan kita buat)
    const user = await this.usersService.findForAuth(email);

    if (user && (await bcrypt.compare(pass, user.password))) {
      // 2. Jika user ditemukan & password cocok, kembalikan user
      // Hapus password dari objek sebelum dikembalikan!
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result; // User tanpa password
    }
    // 3. Jika tidak, return null
    return null;
  }

  /**
   * Dipanggil oleh AuthController untuk men-generate token
   */
  login(user: AuthenticatedUser, response: Response) {
    const payload = { email: user.email, sub: user.id, roleId: user.role.id };
    const token = this.jwtService.sign(payload);

    // 3. Simpan token di HTTP-Only cookie
    response.cookie('access_token', token, {
      httpOnly: true, // JavaScript frontend tidak bisa mengakses
      secure: true, // Hanya HTTPS di produksi
      sameSite: 'none', // Proteksi CSRF
      expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Kadaluwarsa 1 hari
    });

    // 4. Kembalikan data user (tanpa token)
    return { user };
  }

  /** */
  async registerStudent(registerStudentDto: RegisterStudentDto) {
    const { nim, email, password } = registerStudentDto;

    // 1. Cari profil Student berdasarkan NIM
    const student = await this.prisma.student.findUnique({
      where: { nim },
    });

    if (!student) {
      throw new NotFoundException('Student profile not found for this NIM');
    }

    // 2. Cek apakah akun sudah diaktivasi (sudah punya userId)
    if (student.userId) {
      throw new ConflictException(
        'This student account is already registered/activated',
      );
    }

    // 3. Cek apakah email sudah dipakai
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    // 4. Dapatkan ID untuk role "STUDENT"
    const studentRole = await this.prisma.role.findUnique({
      where: { roleName: Role.STUDENT },
    });
    if (!studentRole) {
      throw new Error('STUDENT role not found. Please seed database.');
    }

    // 5. Hash password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    // 6. Gunakan Transaksi: Buat User BARU dan Update Student
    // Ini memastikan kedua operasi berhasil atau keduanya gagal.
    try {
      await this.prisma.$transaction(async (tx) => {
        // a. Buat User baru
        const newUser = await tx.user.create({
          data: {
            email: email,
            password: hashedPassword,
            roleId: studentRole.id,
          },
        });

        // b. Hubungkan User baru ke Student profile
        await tx.student.update({
          where: { id: student.id },
          data: { userId: newUser.id }, // Link akunnya!
        });
      });

      return { message: 'Registration successful. Please login.' };
    } catch (error) {
      console.error('Registration failed:', error);
      throw new ConflictException('Registration failed. Please try again.');
    }
  }
}
