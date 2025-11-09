// 📁 apps/api/src/classes/classes.controller.ts

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
  UseGuards, // <-- 2. Impor
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport'; // <-- 3. Impor
import * as sharedTypes from 'shared-types'; // <-- 6. Impor
import { Roles } from '../auth/decorators/roles.decorator'; // <-- 5. Impor
import { GetUser } from '../auth/decorators/user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard'; // <-- 4. Impor
import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';

// 7. Amankan SELURUH controller ini agar hanya bisa diakses oleh ADMIN
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(sharedTypes.Role.ADMIN)
@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Post()
  create(@Body() createClassDto: CreateClassDto) {
    return this.classesService.create(createClassDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(sharedTypes.Role.ADMIN, sharedTypes.Role.STUDENT)
  findAll(
    @Query('curriculumId') curriculumId?: string,
    @Query('academicYearId') academicYearId?: string, // <-- Tambah query param baru
  ) {
    return this.classesService.findAll(
      curriculumId ? Number(curriculumId) : undefined,
      academicYearId ? Number(academicYearId) : undefined, // <-- Teruskan
    );
  }

  /**
   * [BARU] [UNTUK DOSEN]
   * Melihat semua kelas yang diajar (GET /classes/my)
   */
  @Get('my')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(sharedTypes.Role.LECTURER)
  findMyClasses(@GetUser() user: sharedTypes.AuthenticatedUser) {
    return this.classesService.findMyClasses(user);
  }

  @Get(':id')
  @Roles(
    sharedTypes.Role.ADMIN,
    sharedTypes.Role.LECTURER,
    sharedTypes.Role.STUDENT,
  )
  findOne(@Param('id', ParseIntPipe) id: number) {
    // <-- 8. Terapkan ParseIntPipe
    return this.classesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number, // <-- 8. Terapkan ParseIntPipe
    @Body() updateClassDto: UpdateClassDto,
  ) {
    return this.classesService.update(id, updateClassDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    // <-- 8. Terapkan ParseIntPipe
    return this.classesService.remove(id);
  }
}
