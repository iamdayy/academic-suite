// 📁 apps/api/src/class-enrollment/dto/enroll-student.dto.ts
import { IsNotEmpty, IsNumber } from 'class-validator';

export class EnrollStudentDto {
  @IsNumber()
  @IsNotEmpty()
  studentId: number; // 🔗 Mahasiswa mana

  @IsNumber()
  @IsNotEmpty()
  classId: number; // 🔗 Ke kelas mana
}
