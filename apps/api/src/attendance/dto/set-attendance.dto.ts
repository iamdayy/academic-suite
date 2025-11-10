// 📁 apps/api/src/attendance/dto/set-attendance.dto.ts
import { IsIn, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class SetAttendanceDto {
  @IsNumber()
  @IsNotEmpty()
  sessionId: number; // Sesi mana

  @IsNumber()
  @IsNotEmpty()
  studentId: number; // Mahasiswa mana

  @IsString()
  @IsNotEmpty()
  @IsIn(['HADIR', 'IZIN', 'SAKIT', 'ALPA']) // Opsi lengkap untuk Dosen
  status: string;
}
