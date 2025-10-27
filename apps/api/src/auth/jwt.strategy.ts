// 📁 apps/api/src/auth/jwt.strategy.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  // 'jwt' adalah nama default
  constructor(private usersService: UsersService) {
    super({
      // 1. Tentukan cara mengambil token: dari Header 'Authorization'
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // 2. Jangan abaikan jika token kedaluwarsa (expired)
      ignoreExpiration: false,
      // 3. Secret key untuk memverifikasi token (HARUS SAMA dengan di AuthModule)
      secretOrKey: 'Iamdayy', // <-- TODO: Pindahkan ke .env!
    });
  }

  /**
   * Fungsi ini akan otomatis dipanggil oleh Passport
   * setelah token berhasil diverifikasi.
   * Payload adalah data yang kita masukkan saat login (id, email, roleId)
   */
  async validate(payload: { sub: number; email: string; roleId: number }) {
    // const user = await this.usersService.findOne(payload.sub); // <-- HAPUS INI
    const user = await this.usersService.findProfileById(payload.sub); // <-- GANTI DENGAN INI

    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user; // <-- 'user' ini sekarang berisi data 'role', 'student', 'lecturer'
  }
}
