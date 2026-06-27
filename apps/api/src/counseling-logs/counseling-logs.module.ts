import { Module } from '@nestjs/common';
import { CounselingLogsService } from './counseling-logs.service';
import { CounselingLogsController } from './counseling-logs.controller';

@Module({
  controllers: [CounselingLogsController],
  providers: [CounselingLogsService],
})
export class CounselingLogsModule {}
