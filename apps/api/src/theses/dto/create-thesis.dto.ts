import { IsNotEmpty, IsString, IsOptional, IsArray, IsNumber } from 'class-validator';

export class CreateThesisDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  abstract?: string;
  
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  proposedSupervisorIds?: number[];
}
