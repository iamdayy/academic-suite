// 📁 apps/api/src/auth/auth.service.ts

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
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
    const user = await this.usersService.findOneByEmail(email);

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
  login(user: User) {
    // Payload adalah data yang ingin kita simpan di dalam token
    const payload = {
      email: user.email,
      sub: user.id.toString(),
      roleId: user.roleId,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
