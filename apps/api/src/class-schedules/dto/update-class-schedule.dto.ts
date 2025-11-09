// 📁 apps/api/src/class-schedules/dto/update-class-schedule.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateClassScheduleDto } from './create-class-schedule.dto';

// Update DTO membuat semua field opsional, kecuali classId
export class UpdateClassScheduleDto extends PartialType(
  CreateClassScheduleDto,
) {
  classId?: never; // Kita tidak boleh mengizinkan pemindahan jadwal ke kelas lain
}
