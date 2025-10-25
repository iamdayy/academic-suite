// 📁 apps/api/src/auth/local.strategy.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  // 'local' adalah nama default
  constructor(private authService: AuthService) {
    super({
      // Secara default, passport-local menggunakan 'username'
      // Kita override agar menggunakan 'email'
      usernameField: 'email',
    });
  }

  // Fungsi ini akan otomatis dipanggil oleh Passport
  // saat kita menggunakan 'LocalAuthGuard'
  async validate(email: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user; // User yang di-return akan disimpan di req.user
  }
}
