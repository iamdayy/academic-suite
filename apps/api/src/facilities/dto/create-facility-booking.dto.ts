import { IsNotEmpty, IsNumber, IsString, IsDateString } from 'class-validator';

export class CreateFacilityBookingDto {
  @IsNumber()
  @IsNotEmpty()
  facilityId: number;

  @IsString()
  @IsNotEmpty()
  purpose: string;

  @IsDateString()
  @IsNotEmpty()
  startTime: string;

  @IsDateString()
  @IsNotEmpty()
  endTime: string;
}
