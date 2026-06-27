import { IsNotEmpty, IsString, IsNumber, IsDateString, IsOptional, IsArray } from 'class-validator';

export class CreateThesisDefenseDto {
  @IsNotEmpty()
  @IsNumber()
  thesisId: number;

  @IsNotEmpty()
  @IsDateString()
  scheduledAt: string;

  @IsNotEmpty()
  @IsString()
  room: string;
  
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  examinerIds?: number[];
}
