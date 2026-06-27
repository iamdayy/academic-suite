import { Module } from '@nestjs/common';
import { ThesesService } from './theses.service';
import { ThesesController } from './theses.controller';

@Module({
  controllers: [ThesesController],
  providers: [ThesesService],
})
export class ThesesModule {}
