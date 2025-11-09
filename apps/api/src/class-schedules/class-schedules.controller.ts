// 📁 apps/api/src/class-schedules/class-schedules.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from 'shared-types';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ClassSchedulesService } from './class-schedules.service';
import { CreateClassScheduleDto } from './dto/create-class-schedule.dto';
import { UpdateClassScheduleDto } from './dto/update-class-schedule.dto';

@UseGuards(AuthGuard('jwt'), RolesGuard) // Amankan seluruh controller
@Controller('class-schedules')
export class ClassSchedulesController {
  constructor(private readonly classSchedulesService: ClassSchedulesService) {}

  /**
   * [UNTUK ADMIN]
   * POST /class-schedules
   */
  @Post()
  @Roles(Role.ADMIN)
  create(@Body() createDto: CreateClassScheduleDto) {
    return this.classSchedulesService.create(createDto);
  }

  /**
   * [UNTUK SEMUA ROLE LOGIN]
   * GET /class-schedules?classId=1
   */
  @Get()
  @Roles(Role.ADMIN, Role.LECTURER, Role.STUDENT, Role.GUARDIAN) // Semua bisa lihat jadwal
  findAllByClass(@Query('classId', ParseIntPipe) classId: number) {
    return this.classSchedulesService.findAllByClass(classId);
  }

  /**
   * [UNTUK ADMIN]
   * PATCH /class-schedules/:id
   */
  @Patch(':id')
  @Roles(Role.ADMIN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateClassScheduleDto,
  ) {
    return this.classSchedulesService.update(id, updateDto);
  }

  /**
   * [UNTUK ADMIN]
   * DELETE /class-schedules/:id
   */
  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.classSchedulesService.remove(id);
  }
}
