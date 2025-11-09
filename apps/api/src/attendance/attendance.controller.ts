// 📁 apps/api/src/attendance/attendance.controller.ts
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import * as sharedTypes from 'shared-types';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AttendanceService } from './attendance.service';
import { OpenSessionDto } from './dto/open-session.dto';
import { RecordAttendanceDto } from './dto/record-attendance.dto';

@UseGuards(AuthGuard('jwt'), RolesGuard) // Amankan seluruh controller
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  /**
   * [UNTUK DOSEN]
   * POST /attendance/session/open
   */
  @Post('session/open')
  @Roles(sharedTypes.Role.LECTURER)
  openSession(
    @Body() dto: OpenSessionDto,
    @GetUser() user: sharedTypes.AuthenticatedUser,
  ) {
    return this.attendanceService.openSession(dto, user);
  }

  /**
   * [UNTUK DOSEN]
   * PATCH /attendance/session/:id/close
   */
  @Patch('session/:id/close')
  @Roles(sharedTypes.Role.LECTURER)
  closeSession(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: sharedTypes.AuthenticatedUser,
  ) {
    return this.attendanceService.closeSession(id, user);
  }

  /**
   * [UNTUK DOSEN]
   * GET /attendance/session/:id/records
   */
  @Get('session/:id/records')
  @Roles(sharedTypes.Role.LECTURER)
  getSessionRecords(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: sharedTypes.AuthenticatedUser,
  ) {
    return this.attendanceService.getSessionRecords(id, user);
  }

  /**
   * [UNTUK MAHASISWA & DOSEN]
   * GET /attendance/session/active/:classId
   */
  @Get('session/active/:classId')
  @Roles(sharedTypes.Role.STUDENT, sharedTypes.Role.LECTURER)
  getActiveSession(@Param('classId', ParseIntPipe) classId: number) {
    return this.attendanceService.getActiveSession(classId);
  }

  /**
   * [UNTUK MAHASISWA]
   * POST /attendance/record
   */
  @Post('record')
  @Roles(sharedTypes.Role.STUDENT)
  recordMyAttendance(
    @Body() dto: RecordAttendanceDto,
    @GetUser() user: sharedTypes.AuthenticatedUser,
  ) {
    return this.attendanceService.recordMyAttendance(dto, user);
  }
  /**
   * [BARU] [UNTUK MAHASISWA]
   * GET /attendance/record/my/:sessionId
   */
  @Get('record/my/:sessionId')
  @Roles(sharedTypes.Role.STUDENT)
  getMyRecordForSession(
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @GetUser() user: sharedTypes.AuthenticatedUser,
  ) {
    return this.attendanceService.getMyRecordForSession(sessionId, user);
  }
}
