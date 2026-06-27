import { PartialType } from '@nestjs/mapped-types';
import { CreateThesisDto } from './create-thesis.dto';
import { IsOptional, IsString, IsArray } from 'class-validator';

export class UpdateThesisDto extends PartialType(CreateThesisDto) {
  @IsOptional()
  @IsString()
  status?: string;
  
  @IsOptional()
  @IsArray()
  supervisorApprovals?: { supervisorId: number, status: string }[];
}
