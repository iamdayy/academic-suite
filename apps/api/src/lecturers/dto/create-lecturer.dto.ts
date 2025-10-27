// 📁 apps/api/src/lecturers/dto/create-lecturer.dto.ts
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateLecturerDto {
  @IsString()
  @IsNotEmpty()
  nidn: string; // "0011223344"

  @IsString()
  @IsNotEmpty()
  name: string; // "Dr. Budi Santoso"

  @IsNumber()
  @IsNotEmpty()
  userId: number; // 🔗 Foreign key ke tabel User
}
