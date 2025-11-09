// 📁 apps/api/src/krs-details/dto/create-krs-detail.dto.ts
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateKrsDetailDto {
  @IsNumber()
  @IsNotEmpty()
  krsHeaderId: number; // 🔗 Ke KRS Header mana ini akan ditambahkan

  @IsNumber()
  @IsNotEmpty()
  classId: number; // 🔗 Mata kuliah apa yang ditambahkan
}
