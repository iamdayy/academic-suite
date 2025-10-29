// 📁 apps/api/src/assignments/assignments.controller.ts

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
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('assignments')
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  /**
   * [UNTUK DOSEN]
   * Membuat tugas baru (POST /assignments)
   */
  @Post()
  @UseGuards(RolesGuard)
  @Roles(sharedTypes.Role.LECTURER) // Hanya Dosen
  create(
    @Body() createAssignmentDto: CreateAssignmentDto,
    @GetUser() user: sharedTypes.AuthenticatedUser,
  ) {
    return this.assignmentsService.create(createAssignmentDto, user);
  }

  /**
   * [UNTUK SEMUA ROLE LOGIN] (Termasuk Student)
   * Melihat semua tugas per kelas (GET /assignments/class/:classId)
   */
  @Get('class/:classId')
  findAllByClass(@Param('classId', ParseIntPipe) classId: number) {
    return this.assignmentsService.findAllByClass(classId);
  }

  /**
   * [UNTUK SEMUA ROLE LOGIN] (Termasuk Student)
   * Melihat detail satu tugas (GET /assignments/:id)
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.assignmentsService.findOne(id);
  }

  /**
   * [UNTUK DOSEN]
   * Update tugas (PATCH /assignments/:id)
   */
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(sharedTypes.Role.LECTURER) // Hanya Dosen
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAssignmentDto: UpdateAssignmentDto,
    @GetUser() user: sharedTypes.AuthenticatedUser,
  ) {
    return this.assignmentsService.update(id, updateAssignmentDto, user);
  }

  /**
   * [UNTUK DOSEN]
   * Hapus tugas (DELETE /assignments/:id)
   */
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(sharedTypes.Role.LECTURER) // Hanya Dosen
  remove(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: sharedTypes.AuthenticatedUser,
  ) {
    return this.assignmentsService.remove(id, user);
  }
}
