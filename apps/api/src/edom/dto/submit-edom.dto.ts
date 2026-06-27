import { IsNotEmpty, IsString, IsNumber, IsOptional, ValidateNested, IsArray, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

class AnswerDto {
  @IsNotEmpty()
  @IsNumber()
  questionId: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(5)
  score: number;
}

export class SubmitEdomDto {
  @IsNotEmpty()
  @IsNumber()
  classId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers: AnswerDto[];

  @IsOptional()
  @IsString()
  feedback?: string;
}
