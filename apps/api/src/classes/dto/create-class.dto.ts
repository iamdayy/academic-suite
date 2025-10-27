// 📁 apps/api/src/classes/dto/create-class.dto.ts
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateClassDto {
  @IsString()
  @IsNotEmpty()
  name: string; // "Kelas A", "Kelas B", "Kelas Internasional"

  @IsNumber()
  @IsNotEmpty()
  courseId: number; // 🔗 Foreign key ke tabel Course

  @IsNumber()
  @IsNotEmpty()
  lecturerId: number; // 🔗 Foreign key ke tabel Lecturer

  @IsNumber()
  @IsNotEmpty()
  academicYearId: number; // 🔗 Foreign key ke tabel AcademicYear
}
