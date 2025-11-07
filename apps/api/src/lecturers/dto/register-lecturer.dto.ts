// 📁 apps/api/src/auth/dto/register-lecturer.dto.ts
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterLecturerDto {
  @IsString()
  @IsNotEmpty()
  nidn: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}
