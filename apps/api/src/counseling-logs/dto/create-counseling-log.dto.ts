import { IsNotEmpty, IsString, IsNumber, IsDateString } from 'class-validator';

export class CreateCounselingLogDto {
  @IsNotEmpty()
  @IsNumber()
  thesisId: number;

  @IsNotEmpty()
  @IsNumber()
  lecturerId: number;

  @IsNotEmpty()
  @IsDateString()
  date: string;

  @IsNotEmpty()
  @IsString()
  notes: string;
}
