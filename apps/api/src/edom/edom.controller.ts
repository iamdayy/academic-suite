import { Controller, Get, Post, Body, Patch, Param, UseGuards, Delete } from '@nestjs/common';
import { EdomService } from './edom.service';
import { CreateEdomQuestionDto } from './dto/create-edom-question.dto';
import { SubmitEdomDto } from './dto/submit-edom.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from 'shared-types';
import { GetUser } from '../auth/decorators/user.decorator';
import type { AuthenticatedUser } from 'shared-types';

export class JwtAuthGuard extends AuthGuard('jwt') { }

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('edom')
export class EdomController {
  constructor(private readonly edomService: EdomService) { }

  // ============================
  // QUESTIONS MANAGEMENT (ADMIN)
  // ============================
  @Roles(Role.ADMIN)
  @Post('questions')
  createQuestion(@Body() dto: CreateEdomQuestionDto) {
    return this.edomService.createQuestion(dto);
  }

  @Roles(Role.ADMIN)
  @Patch('questions/:id')
  updateQuestion(@Param('id') id: string, @Body() dto: CreateEdomQuestionDto) {
    return this.edomService.updateQuestion(+id, dto);
  }

  @Roles(Role.ADMIN)
  @Delete('questions/:id')
  deleteQuestion(@Param('id') id: string) {
    return this.edomService.deleteQuestion(+id);
  }

  @Get('questions')
  getQuestions() {
    // Both ADMIN and STUDENT can view active questions
    return this.edomService.getActiveQuestions();
  }

  @Roles(Role.ADMIN)
  @Get('questions/all')
  getAllQuestions() {
    return this.edomService.getAllQuestions();
  }

  // ============================
  // SUBMISSION (STUDENT)
  // ============================
  @Roles(Role.STUDENT)
  @Get('classes')
  getStudentClasses(@GetUser() user: AuthenticatedUser) {
    return this.edomService.getStudentClasses(user);
  }

  @Roles(Role.STUDENT)
  @Post('submissions')
  submitEdom(@Body() dto: SubmitEdomDto, @GetUser() user: AuthenticatedUser) {
    return this.edomService.submitEdom(dto, user);
  }

  // ============================
  // RESULTS (ADMIN, LECTURER)
  // ============================
  @Roles(Role.ADMIN, Role.LECTURER)
  @Get('results/class/:classId')
  getClassResults(@Param('classId') classId: string, @GetUser() user: AuthenticatedUser) {
    return this.edomService.getClassResults(+classId, user);
  }

  @Roles(Role.ADMIN, Role.LECTURER)
  @Get('results/lecturer')
  getLecturerClasses(@GetUser() user: AuthenticatedUser) {
    return this.edomService.getLecturerClasses(user);
  }
}
