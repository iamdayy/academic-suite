// 📁 apps/api/src/auth/auth.controller.ts

import { Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@prisma/client';
import { AuthService } from './auth.service';

// 1. Buat Guard kustom (opsional tapi rapi)
// Ini hanya alias untuk AuthGuard('local')
export class LocalAuthGuard extends AuthGuard('local') {}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Endpoint: POST /auth/login
   */
  @UseGuards(LocalAuthGuard) // 2. Gunakan Guard di sini
  @Post('login')
  login(@Request() req: { user: User }) {
    console.log(req.user);
    return this.authService.login(req.user); // req.user sekarang memiliki tipe User
  }
}
