// 📁 apps/api/src/attendance/dto/open-session.dto.ts
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class OpenSessionDto {
  @IsNumber()
  @IsNotEmpty()
  classScheduleId: number; // 🔗 Jadwal mana yang sedang dibuka

  @IsString()
  @IsOptional()
  notes?: string; // Misal: "Sesi ke-1: Pengenalan"
}
