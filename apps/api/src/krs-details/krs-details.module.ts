import { Module } from '@nestjs/common';
import { KrsDetailsService } from './krs-details.service';
import { KrsDetailsController } from './krs-details.controller';

@Module({
  controllers: [KrsDetailsController],
  providers: [KrsDetailsService],
})
export class KrsDetailsModule {}
