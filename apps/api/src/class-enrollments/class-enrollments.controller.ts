// 📁 apps/api/src/class-enrollment/class-enrollment.controller.ts
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from 'shared-types';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ClassEnrollmentService } from './class-enrollments.service';
import { EnrollStudentDto } from './dto/create-class-enrollment.dto';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('class-enrollment')
export class ClassEnrollmentController {
  constructor(
    private readonly classEnrollmentService: ClassEnrollmentService,
  ) {}

  /**
   * [UNTUK ADMIN]
   * Daftarkan mahasiswa ke kelas (POST /class-enrollment/enroll)
   */
  @Post('enroll')
  @Roles(Role.ADMIN)
  enrollStudent(@Body() enrollStudentDto: EnrollStudentDto) {
    return this.classEnrollmentService.enrollStudent(enrollStudentDto);
  }

  /**
   * [UNTUK ADMIN]
   * Lihat roster kelas (GET /class-enrollment/roster/:classId)
   */
  @Get('roster/:classId')
  @Roles(Role.ADMIN)
  getRosterByClass(@Param('classId', ParseIntPipe) classId: number) {
    return this.classEnrollmentService.getRosterByClass(classId);
  }
}
