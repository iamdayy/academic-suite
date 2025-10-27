// 📁 apps/api/src/majors/dto/create-major.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateMajorDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
