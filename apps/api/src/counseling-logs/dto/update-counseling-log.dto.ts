import { IsOptional, IsString } from 'class-validator';

export class UpdateCounselingLogDto {
  @IsOptional()
  @IsString()
  status?: string;
}
