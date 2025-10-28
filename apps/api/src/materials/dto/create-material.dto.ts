// 📁 apps/api/src/materials/dto/create-material.dto.ts
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateMaterialDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional() // Konten bisa opsional
  content?: string;

  @IsString()
  @IsOptional() // Link file juga opsional
  fileUrl?: string;

  @IsNumber()
  @IsNotEmpty()
  classId: bigint; // 🔗 Ke kelas mana materi ini akan ditambahkan
}
