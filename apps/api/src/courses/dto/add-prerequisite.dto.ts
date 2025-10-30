// 📁 apps/api/src/courses/dto/add-prerequisite.dto.ts
import { IsNotEmpty, IsNumber } from 'class-validator';

export class AddPrerequisiteDto {
  @IsNumber()
  @IsNotEmpty()
  prerequisiteCourseId: number; // ID dari mata kuliah yang MENJADI prasyarat
}
