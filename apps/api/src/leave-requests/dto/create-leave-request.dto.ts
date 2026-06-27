import { IsNotEmpty, IsString, IsNumber, IsOptional, IsUrl } from 'class-validator';

export class CreateLeaveRequestDto {
  @IsNotEmpty()
  @IsNumber()
  academicYearId: number;

  @IsNotEmpty()
  @IsString()
  reason: string;

  @IsOptional()
  @IsString()
  documentUrl?: string;
}
