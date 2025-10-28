// 📁 apps/api/src/academic-years/dto/create-academic-year.dto.ts
import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsString } from 'class-validator';

export class CreateAcademicYearDto {
  @IsString()
  @IsNotEmpty()
  year: string; // "2024/2025"

  @IsString()
  @IsNotEmpty()
  semester: string; // "GANJIL" atau "GENAP"

  @IsDate() // Validasi bahwa ini adalah string tanggal ISO (YYYY-MM-DD)
  @Type(() => Date) // Konversi ke tipe Date
  @IsNotEmpty()
  startDate: string;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  endDate: string;
}
