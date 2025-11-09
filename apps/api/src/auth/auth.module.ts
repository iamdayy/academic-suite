// 📁 apps/api/src/auth/auth.module.ts

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module'; // <-- 1. Impor UsersModule
import { UsersService } from '../users/users.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { LocalStrategy } from './local.strategy';

@Module({
  imports: [
    // 2. Impor UsersModule agar kita bisa menggunakan UsersService
    UsersModule,
    PassportModule,

    // 3. Konfigurasi JWT Module
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'Iamdayy', // <-- TODO: Pindahkan ke .env!
      signOptions: { expiresIn: '1d' }, // Token berlaku selama 1 hari
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy, UsersService], // Nanti kita akan tambah 'Strategy' di sini
  controllers: [AuthController],
})
export class AuthModule {}
