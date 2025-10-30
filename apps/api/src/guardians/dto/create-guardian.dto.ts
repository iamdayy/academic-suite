// 📁 apps/api/src/guardians/dto/create-guardian.dto.ts
import {
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsPhoneNumber,
    IsString,
} from 'class-validator';

export class CreateGuardianDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsPhoneNumber('ID') // Validasi nomor HP Indonesia
  @IsOptional()
  phone?: string;

  @IsNumber()
  @IsNotEmpty()
  userId: number; // 🔗 Foreign key ke tabel User (yang punya role GUARDIAN)
}
