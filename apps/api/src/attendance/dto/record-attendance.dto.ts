// 📁 apps/api/src/attendance/dto/record-attendance.dto.ts
import { IsIn, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class RecordAttendanceDto {
  @IsNumber()
  @IsNotEmpty()
  sessionId: number; // 🔗 Sesi mana yang diisi

  @IsString()
  @IsNotEmpty()
  @IsIn(['HADIR', 'IZIN', 'SAKIT']) // Mahasiswa hanya bisa set ini
  status: string;
}
