import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from 'shared-types';
import { GetUser } from '../auth/decorators/user.decorator';
import type { AuthenticatedUser } from 'shared-types';

export class JwtAuthGuard extends AuthGuard('jwt') { }

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) { }

  @Roles(Role.STUDENT)
  @Get('khs/:academicYearId')
  getKhs(@Param('academicYearId') academicYearId: string, @GetUser() user: AuthenticatedUser) {
    return this.reportsService.getKhs(+academicYearId, user);
  }

  @Roles(Role.STUDENT)
  @Get('transcript')
  getTranscript(@GetUser() user: AuthenticatedUser) {
    return this.reportsService.getTranscript(user);
  }
}
