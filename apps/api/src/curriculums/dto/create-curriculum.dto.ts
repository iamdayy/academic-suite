// 📁 apps/api/src/curriculums/dto/create-curriculum.dto.ts
import { IsInt, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateCurriculumDto {
  @IsString()
  @IsNotEmpty()
  name: string; // "Kurikulum 2020", "Kurikulum Merdeka"

  @IsInt() // Tahun harus berupa integer
  @IsNotEmpty()
  year: number; // 2020, 2023

  @IsNumber()
  @IsNotEmpty()
  studyProgramId: number; // 🔗 Foreign key ke tabel StudyProgram
}
