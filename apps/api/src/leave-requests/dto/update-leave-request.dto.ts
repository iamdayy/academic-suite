import { IsOptional, IsString } from 'class-validator';

export class UpdateLeaveRequestDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  adminNotes?: string;
}
