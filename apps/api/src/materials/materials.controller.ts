// 📁 apps/api/src/materials/materials.controller.ts

import {
  Body,
  Controller,
  Delete,
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
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { MaterialsService } from './materials.service';

// Amankan SELURUH controller ini (harus login)
@UseGuards(AuthGuard('jwt'))
@Controller('materials')
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  /**
   * [UNTUK DOSEN]
   * Membuat materi baru (POST /materials)
   */
  @Post()
  @UseGuards(RolesGuard)
  @Roles(sharedTypes.Role.LECTURER) // Hanya Dosen
  create(
    @Body() createMaterialDto: CreateMaterialDto,
    @GetUser() user: sharedTypes.AuthenticatedUser,
  ) {
    return this.materialsService.create(createMaterialDto, user);
  }

  /**
   * [UNTUK SEMUA ROLE LOGIN] (Termasuk Student)
   * Melihat semua materi per kelas (GET /materials/class/:classId)
   */
  @Get('class/:classId')
  findAllByClass(@Param('classId', ParseIntPipe) classId: number) {
    return this.materialsService.findAllByClass(classId);
  }

  /**
   * [UNTUK SEMUA ROLE LOGIN] (Termasuk Student)
   * Melihat detail satu materi (GET /materials/:id)
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.materialsService.findOne(id);
  }

  /**
   * [UNTUK DOSEN]
   * Update materi (PATCH /materials/:id)
   */
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(sharedTypes.Role.LECTURER) // Hanya Dosen
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMaterialDto: UpdateMaterialDto,
    @GetUser() user: sharedTypes.AuthenticatedUser,
  ) {
    return this.materialsService.update(id, updateMaterialDto, user);
  }

  /**
   * [UNTUK DOSEN]
   * Hapus materi (DELETE /materials/:id)
   */
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(sharedTypes.Role.LECTURER) // Hanya Dosen
  remove(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: sharedTypes.AuthenticatedUser,
  ) {
    return this.materialsService.remove(id, user);
  }
}
