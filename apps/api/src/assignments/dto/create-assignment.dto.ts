// 📁 apps/api/src/assignments/dto/create-assignment.dto.ts
import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateAssignmentDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsDate()
  @Type(() => Date) // Otomatis ubah string "YYYY-MM-DD" menjadi objek Date
  @IsNotEmpty()
  deadline: Date;

  @IsNumber()
  @IsNotEmpty()
  classId: bigint; // 🔗 Ke kelas mana tugas ini akan ditambahkan
}
