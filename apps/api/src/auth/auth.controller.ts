// 📁 apps/api/src/auth/auth.controller.ts

import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@prisma/client';
import { AuthService } from './auth.service';
import { RegisterStudentDto } from './dto/register-student.dto';

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
    return this.authService.login(req.user); // req.user sekarang memiliki tipe User
  }

  @Post('register/student')
  registerStudent(@Body() registrationStudentDto: RegisterStudentDto) {
    return this.authService.registerStudent(registrationStudentDto);
  }
}
