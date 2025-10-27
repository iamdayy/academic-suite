// 📁 apps/api/src/krs-headers/dto/create-krs-header.dto.ts
import { IsInt, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateKrsHeaderDto {
  @IsNumber()
  @IsNotEmpty()
  academicYearId: number; // 🔗 Foreign key ke tabel AcademicYear

  @IsInt()
  @IsNotEmpty()
  semester: number; // Semester ke- (1, 2, 3...)

  // 'studentId' TIDAK ADA di sini.
  // Kita akan mengambilnya dari token user yang login
}
