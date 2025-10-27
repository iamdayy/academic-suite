// 📁 apps/api/src/krs-headers/dto/update-krs-header.dto.ts
import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class UpdateKrsHeaderDto {
  // Hanya status yang boleh di-update oleh Admin
  @IsString()
  @IsNotEmpty()
  @IsIn(['DRAFT', 'APPROVED', 'REJECTED']) // Hanya boleh salah satu dari ini
  status: string;
}
