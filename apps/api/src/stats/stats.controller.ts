// 📁 apps/api/src/stats/stats.controller.ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import * as sharedTypes from 'shared-types';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { StatsService } from './stats.service';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  /**
   * [UNTUK ADMIN]
   * GET /stats/admin
   */
  @Get('admin')
  @Roles(sharedTypes.Role.ADMIN) // Hanya Admin
  getAdminStats() {
    return this.statsService.getAdminStats();
  }

  /**
   * [BARU] [UNTUK MAHASISWA]
   * GET /stats/student/me
   */
  @Get('student/me')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(sharedTypes.Role.STUDENT) // Hanya Mahasiswa
  getStudentStats(@GetUser() user: sharedTypes.AuthenticatedUser) {
    return this.statsService.getStudentStats(user);
  }
  /**
   * [BARU] [UNTUK DOSEN]
   * GET /stats/lecturer/me
   */
  @Get('lecturer/me')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(sharedTypes.Role.LECTURER) // Hanya Dosen
  getLecturerStats(@GetUser() user: sharedTypes.AuthenticatedUser) {
    return this.statsService.getLecturerStats(user);
  }

  /**
   * [BARU] [UNTUK WALI]
   * GET /stats/guardian/me
   */
  @Get('guardian/me')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(sharedTypes.Role.GUARDIAN) // Hanya Wali
  getGuardianStats(@GetUser() user: sharedTypes.AuthenticatedUser) {
    return this.statsService.getGuardianStats(user);
  }
}
