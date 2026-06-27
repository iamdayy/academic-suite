import { IsNotEmpty, IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateEdomQuestionDto {
  @IsNotEmpty()
  @IsString()
  question: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
