import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/decorators/user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from 'shared-types';
import type { AuthenticatedUser } from 'shared-types';

export class JwtAuthGuard extends AuthGuard('jwt') { }

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.create(createNotificationDto);
  }

  @Get()
  findMyNotifications(@GetUser() user: AuthenticatedUser) {
    return this.notificationsService.findMyNotifications(user.id);
  }

  @Patch('read-all')
  markAllAsRead(@GetUser() user: AuthenticatedUser) {
    return this.notificationsService.markAllAsRead(user.id);
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string, @GetUser() user: AuthenticatedUser) {
    return this.notificationsService.markAsRead(+id, user.id);
  }
}
