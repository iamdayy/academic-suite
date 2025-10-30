// 📁 apps/api/src/guardians/dto/connect-student.dto.ts
import { IsNotEmpty, IsNumber } from 'class-validator';

export class ConnectStudentDto {
  @IsNumber()
  @IsNotEmpty()
  studentId: number;
}
