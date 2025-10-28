// 📁 apps/api/src/krs-headers/krs-headers.controller.ts

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
import { GetUser } from '../auth/decorators/user.decorator'; // <-- 1. Impor decorator @GetUser
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateKrsHeaderDto } from './dto/create-krs-header.dto';
import { UpdateKrsHeaderDto } from './dto/update-krs-header.dto';
import { KrsHeadersService } from './krs-headers.service';

// Amankan SELURUH controller ini (harus login)
@UseGuards(AuthGuard('jwt'))
@Controller('krs-headers')
export class KrsHeadersController {
  constructor(private readonly krsHeadersService: KrsHeadersService) {}

  /**
   * [UNTUK STUDENT]
   * Membuat KrsHeader baru (POST /krs-headers)
   */
  @Post()
  @UseGuards(RolesGuard)
  @Roles(sharedTypes.Role.STUDENT) // Hanya STUDENT yang bisa membuat
  create(
    @Body() createKrsHeaderDto: CreateKrsHeaderDto,
    @GetUser() user: sharedTypes.AuthenticatedUser, // <-- 2. Ambil user yang login
  ) {
    return this.krsHeadersService.create(createKrsHeaderDto, user);
  }

  /**
   * [UNTUK STUDENT]
   * Melihat semua KRS miliknya (GET /krs-headers/my)
   */
  @Get('my')
  @UseGuards(RolesGuard)
  @Roles(sharedTypes.Role.STUDENT) // Hanya STUDENT
  findMyHeaders(@GetUser() user: sharedTypes.AuthenticatedUser) {
    return this.krsHeadersService.findMyHeaders(user);
  }

  /**
   * [UNTUK ADMIN]
   * Melihat semua KRS (GET /krs-headers)
   */
  @Get()
  @UseGuards(RolesGuard)
  @Roles(sharedTypes.Role.ADMIN) // Hanya ADMIN
  findAll() {
    return this.krsHeadersService.findAll();
  }

  /**
   * [UNTUK STUDENT & ADMIN]
   * Melihat detail satu KRS (GET /krs-headers/:id)
   */
  @Get(':id')
  // Keamanan ditangani di dalam service (cek kepemilikan)
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: sharedTypes.AuthenticatedUser,
  ) {
    return this.krsHeadersService.findOne(id, user);
  }

  /**
   * [UNTUK ADMIN]
   * Update status KRS (PATCH /krs-headers/:id)
   */
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(sharedTypes.Role.ADMIN) // Hanya ADMIN
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateKrsHeaderDto: UpdateKrsHeaderDto,
  ) {
    return this.krsHeadersService.update(id, updateKrsHeaderDto);
  }

  /**
   * [UNTUK ADMIN]
   * Hapus KRS (DELETE /krs-headers/:id)
   */
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(sharedTypes.Role.ADMIN) // Hanya ADMIN
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.krsHeadersService.remove(id);
  }
}
