import { Module } from '@nestjs/common';
import { AlumniService } from './alumni.service';
import { AlumniController } from './alumni.controller';
import { ReportsModule } from '../reports/reports.module';

@Module({
  imports: [ReportsModule], // Import ReportsModule to reuse getTranscript logic for IPK calculation
  controllers: [AlumniController],
  providers: [AlumniService],
})
export class AlumniModule {}
