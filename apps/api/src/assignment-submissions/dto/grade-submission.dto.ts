// 📁 apps/api/src/assignment-submissions/dto/grade-submission.dto.ts
import { IsNotEmpty, IsNumber, Max, Min } from 'class-validator';

export class GradeSubmissionDto {
  @IsNumber()
  @Min(0)
  @Max(100) // Asumsi nilai 0-100
  @IsNotEmpty()
  grade: number;
}
