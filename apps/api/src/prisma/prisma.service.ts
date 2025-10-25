// 📁 apps/api/src/prisma/prisma.service.ts

import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    // Memanggil konstruktor super() dari PrismaClient
    super();
  }

  async onModuleInit() {
    // Terhubung ke database saat modul diinisialisasi
    await this.$connect();
  }

  async onModuleDestroy() {
    // Putuskan koneksi saat aplikasi dimatikan
    await this.$disconnect();
  }
}
