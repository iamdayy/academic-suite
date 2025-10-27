import { Module } from '@nestjs/common';
import { KrsHeadersService } from './krs-headers.service';
import { KrsHeadersController } from './krs-headers.controller';

@Module({
  controllers: [KrsHeadersController],
  providers: [KrsHeadersService],
})
export class KrsHeadersModule {}
