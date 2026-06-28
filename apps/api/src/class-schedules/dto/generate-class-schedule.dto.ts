import { IsNotEmpty, IsNumber } from 'class-validator';

export class GenerateClassScheduleDto {
  @IsNotEmpty()
  @IsNumber()
  academicYearId: number;
}
