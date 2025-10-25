// 📁 apps/api/src/users/dto/create-user.dto.ts
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsNumber()
  @IsNotEmpty()
  roleId: number; // Nanti kita hubungkan ke Role
}
