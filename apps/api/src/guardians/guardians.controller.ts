// 📁 apps/api/src/guardians/guardians.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards, // <-- Impor
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport'; // <-- Impor
import { Role } from 'shared-types'; // <-- Impor
import { Roles } from '../auth/decorators/roles.decorator'; // <-- Impor
import { RolesGuard } from '../auth/guards/roles.guard'; // <-- Impor
import { ConnectStudentDto } from './dto/connect-student.dto';
import { CreateGuardianDto } from './dto/create-guardian.dto';
import { UpdateGuardianDto } from './dto/update-guardian.dto';
import { GuardiansService } from './guardians.service';

@UseGuards(AuthGuard('jwt'), RolesGuard) // <-- Amankan
@Roles(Role.ADMIN) // <-- Hanya Admin
@Controller('guardians')
export class GuardiansController {
  constructor(private readonly guardiansService: GuardiansService) {}

  @Post()
  create(@Body() createGuardianDto: CreateGuardianDto) {
    return this.guardiansService.create(createGuardianDto);
  }

  @Get()
  findAll() {
    return this.guardiansService.findAll();
  }

  /**
   * [BARU] [UNTUK ADMIN]
   * Hubungkan Wali ke Mahasiswa (POST /guardians/:id/connect-student)
   */
  @Post(':id/connect-student')
  connectStudent(
    @Param('id', ParseIntPipe) id: number,
    @Body() connectDto: ConnectStudentDto,
  ) {
    return this.guardiansService.connectStudent(id, connectDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    // <-- Tambah ParseIntPipe
    return this.guardiansService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number, // <-- Tambah ParseIntPipe
    @Body() updateGuardianDto: UpdateGuardianDto,
  ) {
    return this.guardiansService.update(id, updateGuardianDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    // <-- Tambah ParseIntPipe
    return this.guardiansService.remove(id);
  }
}
