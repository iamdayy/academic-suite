// 📁 apps/api/src/students/dto/create-student.dto.ts
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateStudentDto {
  @IsString()
  @IsNotEmpty()
  nim: string; // "20210001"

  @IsString()
  @IsNotEmpty()
  name: string; // "Ayu Lestari"

  @IsNumber()
  @IsNotEmpty()
  userId: number; // 🔗 Foreign key ke tabel User

  @IsNumber()
  @IsNotEmpty()
  studyProgramId: number; // 🔗 Foreign key ke tabel StudyProgram
}
