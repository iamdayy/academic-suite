// 📁 apps/api/src/courses/dto/create-course.dto.ts
import { IsInt, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  code: string; // "IF101"

  @IsString()
  @IsNotEmpty()
  name: string; // "Dasar Pemrograman"

  @IsInt()
  @IsNotEmpty()
  credits: number; // SKS (misal: 3)

  @IsInt()
  @IsNotEmpty()
  semester: number; // Semester ke- (misal: 1)

  @IsNumber()
  @IsNotEmpty()
  curriculumId: number; // 🔗 Foreign key ke tabel Curriculum
}
