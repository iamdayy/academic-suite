// 📁 apps/api/src/courses/courses.controller.ts

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query, // <-- 1. Impor
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport'; // <-- 3. Impor
import * as sharedTypes from 'shared-types'; // <-- 6. Impor
import { Roles } from '../auth/decorators/roles.decorator'; // <-- 5. Impor
import { RolesGuard } from '../auth/guards/roles.guard'; // <-- 4. Impor
import { CoursesService } from './courses.service';
import { AddPrerequisiteDto } from './dto/add-prerequisite.dto';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

// 7. Amankan SELURUH controller ini agar hanya bisa diakses oleh ADMIN
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @Roles(sharedTypes.Role.ADMIN)
  create(@Body() createCourseDto: CreateCourseDto) {
    return this.coursesService.create(createCourseDto);
  }

  @Get()
  @Roles(sharedTypes.Role.ADMIN)
  findAll(@Query('curriculumId') curriculumId?: number) {
    return this.coursesService.findAll(
      curriculumId ? Number(curriculumId) : undefined,
    );
  }

  @Get(':id')
  @Roles(sharedTypes.Role.ADMIN)
  findOne(@Param('id', ParseIntPipe) id: number) {
    // <-- 8. Terapkan ParseIntPipe
    return this.coursesService.findOne(Number(id));
  }

  @Patch(':id')
  @Roles(sharedTypes.Role.ADMIN)
  update(
    @Param('id', ParseIntPipe) id: number, // <-- 8. Terapkan ParseIntPipe
    @Body() updateCourseDto: UpdateCourseDto,
  ) {
    return this.coursesService.update(id, updateCourseDto);
  }

  @Delete(':id')
  @Roles(sharedTypes.Role.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.coursesService.remove(id);
  }
  /**
   *
   * Tambah prasyarat (POST /courses/:id/prerequisite)
   */

  @Post(':id/prerequisite')
  @Roles(sharedTypes.Role.ADMIN)
  addPrerequisite(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AddPrerequisiteDto,
  ) {
    return this.coursesService.addPrerequisite(id, dto);
  }
}
