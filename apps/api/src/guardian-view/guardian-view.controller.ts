// 📁 apps/api/src/guardian-view/guardian-view.controller.ts
import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import * as sharedTypes from 'shared-types';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { GuardianViewService } from './guardian-view.service';

// Amankan seluruh controller ini HANYA untuk WALI
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(sharedTypes.Role.GUARDIAN)
@Controller('guardian-view')
export class GuardianViewController {
  constructor(private readonly guardianViewService: GuardianViewService) {}

  /**
   * [UNTUK WALI]
   * Mengambil daftar anak/mahasiswa yang diwalikan
   * GET /guardian-view/my-students
   */
  @Get('my-students')
  getMyStudents(@GetUser() user: sharedTypes.AuthenticatedUser) {
    return this.guardianViewService.getMyStudents(user);
  }

  /**
   * [UNTUK WALI]
   * Mengambil detail akademik satu mahasiswa
   * GET /guardian-view/student/:id
   */
  @Get('student/:id')
  getStudentDetails(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: sharedTypes.AuthenticatedUser,
  ) {
    return this.guardianViewService.getStudentDetails(id, user);
  }
}
