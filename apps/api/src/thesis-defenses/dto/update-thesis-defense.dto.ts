import { IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdateThesisDefenseDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsNumber()
  score?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
