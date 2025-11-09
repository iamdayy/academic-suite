// 📁 apps/api/src/academic-years/academic-years.controller.ts

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
import { AcademicYearsService } from './academic-years.service';
import { CreateAcademicYearDto } from './dto/create-academic-year.dto';
import { UpdateAcademicYearDto } from './dto/update-academic-year.dto';

// 7. Amankan SELURUH controller ini agar hanya bisa diakses oleh ADMIN
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('academic-years')
export class AcademicYearsController {
  constructor(private readonly academicYearsService: AcademicYearsService) {}

  // 2. Terapkan @Roles ke setiap metode SECARA INDIVIDUAL
  @Post()
  @Roles(Role.ADMIN) // Hanya Admin
  create(@Body() createAcademicYearDto: CreateAcademicYearDto) {
    return this.academicYearsService.create(createAcademicYearDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.STUDENT)
  findAll() {
    return this.academicYearsService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN) // Hanya Admin
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.academicYearsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN) // Hanya Admin
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAcademicYearDto: UpdateAcademicYearDto,
  ) {
    return this.academicYearsService.update(id, updateAcademicYearDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN) // Hanya Admin
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.academicYearsService.remove(id);
  }
}
