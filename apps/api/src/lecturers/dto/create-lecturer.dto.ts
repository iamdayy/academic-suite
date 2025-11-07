// 📁 apps/api/src/lecturers/dto/create-lecturer.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateLecturerDto {
  @IsString()
  @IsNotEmpty()
  nidn: string; // "0011223344"

  @IsString()
  @IsNotEmpty()
  name: string; // "Dr. Budi Santoso"
}
