// 📁 apps/api/api/index.ts
// Ini adalah entry point serverless untuk Vercel

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import express from 'express';
import { AppModule } from '../src/app.module';

// Simpan 'app' di cache agar tidak perlu 'bootstrap' setiap kali
let cachedApp;

async function bootstrap() {
  if (!cachedApp) {
    const expressApp = express();
    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp),
    );

    // Atur prefix global agar cocok dengan rewrite (PENTING!)
    app.setGlobalPrefix('api');

    // Terapkan semua middleware dari main.ts
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );

    // Atur CORS agar hanya mengizinkan frontend Vercel Anda
    app.enableCors({
      origin: process.env.FRONTEND_URL, // Akan kita atur di Vercel
      credentials: true,
    });

    app.use(cookieParser());

    await app.init();
    cachedApp = expressApp; // Simpan app yang sudah siap
  }
  return cachedApp;
}

// Ini adalah handler yang akan dipanggil Vercel
export default async (req, res) => {
  const app = await bootstrap();
  app(req, res);
};
