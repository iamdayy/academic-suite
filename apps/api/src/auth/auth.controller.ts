// 📁 apps/api/src/auth/auth.controller.ts

import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Request,
  Response,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import express from 'express';
import * as sharedTypes from 'shared-types';
import { RegisterLecturerDto } from '../lecturers/dto/register-lecturer.dto';
import { JwtAuthGuard } from '../users/users.controller';
import { AuthService } from './auth.service';
import { GetUser } from './decorators/user.decorator';
import { ChangePasswordDto } from './dto/change-password.dto';
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
  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(
    @Request() req: { user: sharedTypes.AuthenticatedUser },
    @Response({ passthrough: true }) res: express.Response, // <-- 3. Inject Response
  ) {
    // 4. Teruskan 'res' ke service
    // 'passthrough: true' penting agar NestJS tetap mengirim respons
    return this.authService.login(req.user, res);
  }

  @Post('register/student')
  registerStudent(@Body() registrationStudentDto: RegisterStudentDto) {
    return this.authService.registerStudent(registrationStudentDto);
  }
  @Post('register/lecturer')
  registerLecturer(@Body() registrationLecturerDto: RegisterLecturerDto) {
    return this.authService.registerLecturer(registrationLecturerDto);
  }

  /**
   * Endpoint: GET /auth/me
   */

  @UseGuards(JwtAuthGuard) // 5. Amankan dengan Guard!
  @Get('me')
  getProfile(@GetUser() user: sharedTypes.AuthenticatedUser) {
    // 6. Cukup kembalikan user yang sudah divalidasi
    //    oleh JwtStrategy dan @GetUser
    return user;
  }

  @Post('logout')
  logout(@Response({ passthrough: true }) res: express.Response) {
    // 3. Bersihkan cookie
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });
    return { message: 'Logout successful' };
  }

  /**
   * [BARU] [UNTUK SEMUA ROLE LOGIN]
   * Ganti password (PATCH /auth/change-password)
   */
  @UseGuards(JwtAuthGuard) // Amankan, harus login
  @Patch('change-password')
  changePassword(
    @GetUser() user: sharedTypes.AuthenticatedUser,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(user, changePasswordDto);
  }
}
