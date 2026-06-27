import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateNotificationDto) {
    return this.prisma.notification.create({
      data: dto
    });
  }

  async findMyNotifications(userId: bigint) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50 // Limit to latest 50 notifications
    });
  }

  async markAsRead(id: number, userId: bigint) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true }
    });
  }

  async markAllAsRead(userId: bigint) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    });
  }
}
