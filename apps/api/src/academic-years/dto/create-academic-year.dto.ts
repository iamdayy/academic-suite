// 📁 apps/api/src/academic-years/dto/create-academic-year.dto.ts
import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class CreateAcademicYearDto {
  @IsString()
  @IsNotEmpty()
  year: string; // "2024/2025"

  @IsString()
  @IsNotEmpty()
  semester: string; // "GANJIL" atau "GENAP"

  @IsDateString() // Validasi bahwa ini adalah string tanggal ISO (YYYY-MM-DD)
  @IsNotEmpty()
  startDate: string;

  @IsDateString()
  @IsNotEmpty()
  endDate: string;
}
