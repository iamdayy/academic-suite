// 📁 apps/api/src/study-programs/dto/create-study-program.dto.ts
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateStudyProgramDto {
  @IsString()
  @IsNotEmpty()
  name: string; // "S1 Teknik Informatika"

  @IsString()
  @IsNotEmpty()
  level: string; // "S1", "D3", dll.

  @IsNumber()
  @IsNotEmpty()
  majorId: number; // 🔗 Foreign key ke tabel Major
}
