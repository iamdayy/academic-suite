// 📁 apps/api/src/assignment-submissions/dto/create-assignment-submission.dto.ts
import { IsNotEmpty, IsNumber, IsString, IsUrl } from 'class-validator';

export class CreateAssignmentSubmissionDto {
  @IsString()
  @IsUrl() // Memvalidasi bahwa ini adalah URL yang valid
  @IsNotEmpty()
  fileUrl: string; // "https://storage.provider.com/path/to/file.pdf"

  @IsNumber()
  @IsNotEmpty()
  assignmentId: number; // 🔗 Ke tugas mana ini dikumpulkan
}
