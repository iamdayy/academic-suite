// 📁 apps/api/src/students/students.controller.ts

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post, // <-- 1. Impor
  UseGuards, // <-- 2. Impor
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport'; // <-- 3. Impor
import { Role } from 'shared-types'; // <-- 6. Impor
import { Roles } from '../auth/decorators/roles.decorator'; // <-- 5. Impor
import { RolesGuard } from '../auth/guards/roles.guard'; // <-- 4. Impor
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentsService } from './students.service';

// 7. Amankan SELURUH controller ini agar hanya bisa diakses oleh ADMIN
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.ADMIN)
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentsService.create(createStudentDto);
  }

  @Get()
  findAll() {
    return this.studentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    // <-- 8. Terapkan ParseIntPipe
    return this.studentsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number, // <-- 8. Terapkan ParseIntPipe
    @Body() updateStudentDto: UpdateStudentDto,
  ) {
    return this.studentsService.update(id, updateStudentDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    // <-- 8. Terapkan ParseIntPipe
    return this.studentsService.remove(id);
  }
}
