import { Module } from '@nestjs/common';
import { StudyProgramsService } from './study-programs.service';
import { StudyProgramsController } from './study-programs.controller';

@Module({
  controllers: [StudyProgramsController],
  providers: [StudyProgramsService],
})
export class StudyProgramsModule {}
