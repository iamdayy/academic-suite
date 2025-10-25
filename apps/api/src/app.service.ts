import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}
  getHello(): string {
    return 'Hello World!';
  }
  async getFirstUser() {
    const user = await this.prisma.user.findUnique({
      where: {
        id: 1,
      },
    });
    console.log(user);
    return user;
  }
}
