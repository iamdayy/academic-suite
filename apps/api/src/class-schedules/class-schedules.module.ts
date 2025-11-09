import { Module } from '@nestjs/common';
import { ClassSchedulesService } from './class-schedules.service';
import { ClassSchedulesController } from './class-schedules.controller';

@Module({
  providers: [ClassSchedulesService],
  controllers: [ClassSchedulesController]
})
export class ClassSchedulesModule {}
