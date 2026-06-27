import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { AlumniService } from './alumni.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from 'shared-types';
import { GetUser } from '../auth/decorators/user.decorator';
import type { AuthenticatedUser } from 'shared-types';

export class JwtAuthGuard extends AuthGuard('jwt') { }

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('alumni')
export class AlumniController {
  constructor(private readonly alumniService: AlumniService) { }

  // ============================
  // YUDISIUM
  // ============================
  @Roles(Role.STUDENT)
  @Post('yudisium')
  applyYudisium(@GetUser() user: AuthenticatedUser) {
    return this.alumniService.applyYudisium(user);
  }

  @Roles(Role.STUDENT)
  @Get('yudisium/me')
  getMyYudisium(@GetUser() user: AuthenticatedUser) {
    return this.alumniService.getMyYudisium(user);
  }

  @Roles(Role.ADMIN)
  @Get('yudisium')
  getAllYudisium() {
    return this.alumniService.getAllYudisium();
  }

  @Roles(Role.ADMIN)
  @Patch('yudisium/:id')
  updateYudisiumStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.alumniService.updateYudisiumStatus(+id, status);
  }

  // ============================
  // WISUDA
  // ============================
  @Roles(Role.ADMIN)
  @Post('wisuda/events')
  createWisudaEvent(@Body() dto: { batchName: string; eventDate: string }) {
    return this.alumniService.createWisudaEvent(dto);
  }

  @Roles(Role.ADMIN, Role.STUDENT)
  @Get('wisuda/events')
  getWisudaEvents() {
    return this.alumniService.getWisudaEvents();
  }

  @Roles(Role.STUDENT)
  @Post('wisuda/register')
  registerWisuda(@Body('eventId') eventId: number, @GetUser() user: AuthenticatedUser) {
    return this.alumniService.registerWisuda(eventId, user);
  }

  @Roles(Role.ADMIN)
  @Get('wisuda/events/:id/participants')
  getWisudaParticipants(@Param('id') eventId: string) {
    return this.alumniService.getWisudaParticipants(+eventId);
  }

  @Roles(Role.STUDENT)
  @Get('wisuda/me')
  getMyWisuda(@GetUser() user: AuthenticatedUser) {
    return this.alumniService.getMyWisuda(user);
  }

  // ============================
  // TRACER STUDY
  // ============================
  @Roles(Role.STUDENT)
  @Post('tracer')
  submitTracerStudy(@Body() dto: any, @GetUser() user: AuthenticatedUser) {
    return this.alumniService.submitTracerStudy(dto, user);
  }

  @Roles(Role.STUDENT)
  @Get('tracer/me')
  getMyTracerStudy(@GetUser() user: AuthenticatedUser) {
    return this.alumniService.getMyTracerStudy(user);
  }

  @Roles(Role.ADMIN)
  @Get('tracer')
  getTracerStudies() {
    return this.alumniService.getTracerStudies();
  }
}
