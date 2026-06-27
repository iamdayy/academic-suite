import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { LeaveRequestsService } from './leave-requests.service';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { UpdateLeaveRequestDto } from './dto/update-leave-request.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from 'shared-types';
import { GetUser } from '../auth/decorators/user.decorator';
import type { AuthenticatedUser } from 'shared-types';

export class JwtAuthGuard extends AuthGuard('jwt') { }

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('leave-requests')
export class LeaveRequestsController {
  constructor(private readonly leaveRequestsService: LeaveRequestsService) { }

  @Roles(Role.STUDENT)
  @Post()
  create(@Body() createLeaveRequestDto: CreateLeaveRequestDto, @GetUser() user: AuthenticatedUser) {
    return this.leaveRequestsService.create(createLeaveRequestDto, user);
  }

  @Roles(Role.ADMIN)
  @Get()
  findAll() {
    return this.leaveRequestsService.findAll();
  }

  @Roles(Role.STUDENT)
  @Get('my')
  findMyRequests(@GetUser() user: AuthenticatedUser) {
    return this.leaveRequestsService.findMyRequests(user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.leaveRequestsService.findOne(+id);
  }

  @Roles(Role.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLeaveRequestDto: UpdateLeaveRequestDto) {
    return this.leaveRequestsService.update(+id, updateLeaveRequestDto);
  }
}
