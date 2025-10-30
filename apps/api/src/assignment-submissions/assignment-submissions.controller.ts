// 📁 apps/api/src/assignment-submissions/assignment-submissions.controller.ts

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
import { AssignmentSubmissionsService } from './assignment-submissions.service';
import { CreateAssignmentSubmissionDto } from './dto/create-assignment-submission.dto';
import { GradeSubmissionDto } from './dto/grade-submission.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('assignment-submissions')
export class AssignmentSubmissionsController {
  constructor(
    private readonly assignmentSubmissionsService: AssignmentSubmissionsService,
  ) {}

  /**
   * [UNTUK STUDENT]
   * Mengumpulkan tugas (POST /assignment-submissions)
   */
  @Post()
  @UseGuards(RolesGuard)
  @Roles(sharedTypes.Role.STUDENT)
  create(
    @Body() createDto: CreateAssignmentSubmissionDto,
    @GetUser() user: sharedTypes.AuthenticatedUser,
  ) {
    return this.assignmentSubmissionsService.create(createDto, user);
  }

  /**
   * [UNTUK LECTURER]
   * Melihat semua submission per tugas (GET /assignment-submissions/assignment/:assignmentId)
   */
  @Get('assignment/:assignmentId')
  @UseGuards(RolesGuard)
  @Roles(sharedTypes.Role.LECTURER)
  findAllByAssignment(
    @Param('assignmentId', ParseIntPipe) assignmentId: number,
  ) {
    return this.assignmentSubmissionsService.findAllByAssignment(assignmentId);
  }

  /**
   * [BARU] [UNTUK DOSEN]
   * Memberi nilai (PATCH /assignment-submissions/:id/grade)
   */
  @Patch(':id/grade')
  @UseGuards(RolesGuard)
  @Roles(sharedTypes.Role.LECTURER)
  gradeSubmission(
    @Param('id', ParseIntPipe) id: number,
    @Body() gradeDto: GradeSubmissionDto,
    @GetUser() user: sharedTypes.AuthenticatedUser,
  ) {
    return this.assignmentSubmissionsService.gradeSubmission(
      id,
      gradeDto,
      user,
    );
  }

  /**
   * [UNTUK STUDENT]
   * Melihat submission mereka sendiri (GET /assignment-submissions/my/:assignmentId)
   */
  @Get('my/:assignmentId')
  @UseGuards(RolesGuard)
  @Roles(sharedTypes.Role.STUDENT)
  findMySubmission(
    @Param('assignmentId', ParseIntPipe) assignmentId: number,
    @GetUser() user: sharedTypes.AuthenticatedUser,
  ) {
    return this.assignmentSubmissionsService.findMySubmission(
      assignmentId,
      user,
    );
  }

  /**
   * [UNTUK STUDENT]
   * Menghapus/Membatalkan submission (DELETE /assignment-submissions/:id)
   */
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(sharedTypes.Role.STUDENT)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: sharedTypes.AuthenticatedUser,
  ) {
    return this.assignmentSubmissionsService.remove(id, user);
  }

  // Kita tidak mengekspos GET (all), GET (by id), atau PATCH
}
