// 📁 apps/api/src/class-enrollment/class-enrollment.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import * as sharedTypes from 'shared-types';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/user.decorator';
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
  @Roles(sharedTypes.Role.ADMIN)
  enrollStudent(@Body() enrollStudentDto: EnrollStudentDto) {
    return this.classEnrollmentService.enrollStudent(enrollStudentDto);
  }

  /**
   * [UNTUK ADMIN]
   * Lihat roster kelas (GET /class-enrollment/roster/:classId)
   */
  @Get('roster/:classId')
  @Roles(sharedTypes.Role.ADMIN, sharedTypes.Role.LECTURER)
  getRosterByClass(
    @Param('classId', ParseIntPipe) classId: number,
    @GetUser() user: sharedTypes.AuthenticatedUser,
  ) {
    return this.classEnrollmentService.getRosterByClass(classId, user);
  }

  /**
   * [BARU] [UNTUK STUDENT]
   * GET /class-enrollment/my-classes
   */
  @Get('my-classes')
  @Roles(sharedTypes.Role.STUDENT)
  getMyClasses(@GetUser() user: sharedTypes.AuthenticatedUser) {
    return this.classEnrollmentService.getMyClasses(user);
  }

  /**
   * [BARU] [UNTUK ADMIN]
   * Hapus mahasiswa dari kelas (DELETE /class-enrollment/:id)
   */
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(sharedTypes.Role.ADMIN)
  removeEnrollment(@Param('id', ParseIntPipe) id: number) {
    return this.classEnrollmentService.removeEnrollment(id);
  }
}
