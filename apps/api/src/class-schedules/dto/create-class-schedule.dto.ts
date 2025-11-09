// 📁 apps/api/src/class-schedules/dto/create-class-schedule.dto.ts
import { IsNotEmpty, IsNumber, IsString, Matches } from 'class-validator';

export class CreateClassScheduleDto {
  @IsNumber()
  @IsNotEmpty()
  classId: number; // 🔗 Ke kelas mana jadwal ini akan ditambahkan

  @IsString()
  @IsNotEmpty()
  dayOfWeek: string; // "SENIN", "SELASA", dll.

  @IsString()
  @IsNotEmpty()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/) // Validasi format HH:MM
  startTime: string; // "08:00"

  @IsString()
  @IsNotEmpty()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/) // Validasi format HH:MM
  endTime: string; // "10:30"

  @IsString()
  @IsNotEmpty()
  room: string; // "Gedung A Ruang 101"
}
