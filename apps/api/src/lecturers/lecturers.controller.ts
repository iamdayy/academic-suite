// 📁 apps/api/src/lecturers/lecturers.controller.ts

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
import { CreateLecturerDto } from './dto/create-lecturer.dto';
import { UpdateLecturerDto } from './dto/update-lecturer.dto';
import { LecturersService } from './lecturers.service';

// 7. Amankan SELURUH controller ini agar hanya bisa diakses oleh ADMIN
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.ADMIN)
@Controller('lecturers')
export class LecturersController {
  constructor(private readonly lecturersService: LecturersService) {}

  @Post()
  create(@Body() createLecturerDto: CreateLecturerDto) {
    return this.lecturersService.create(createLecturerDto);
  }

  @Get()
  findAll() {
    return this.lecturersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    // <-- 8. Terapkan ParseIntPipe
    return this.lecturersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number, // <-- 8. Terapkan ParseIntPipe
    @Body() updateLecturerDto: UpdateLecturerDto,
  ) {
    return this.lecturersService.update(id, updateLecturerDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    // <-- 8. Terapkan ParseIntPipe
    return this.lecturersService.remove(id);
  }
}
