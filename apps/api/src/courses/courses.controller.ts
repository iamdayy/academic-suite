// 📁 apps/api/src/courses/courses.controller.ts

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
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

// 7. Amankan SELURUH controller ini agar hanya bisa diakses oleh ADMIN
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.ADMIN)
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  create(@Body() createCourseDto: CreateCourseDto) {
    return this.coursesService.create(createCourseDto);
  }

  @Get()
  findAll() {
    return this.coursesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    // <-- 8. Terapkan ParseIntPipe
    return this.coursesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number, // <-- 8. Terapkan ParseIntPipe
    @Body() updateCourseDto: UpdateCourseDto,
  ) {
    return this.coursesService.update(id, updateCourseDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    // <-- 8. Terapkan ParseIntPipe
    return this.coursesService.remove(id);
  }
}
