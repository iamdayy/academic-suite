import { Module } from '@nestjs/common';
import { EdomService } from './edom.service';
import { EdomController } from './edom.controller';

@Module({
  controllers: [EdomController],
  providers: [EdomService],
})
export class EdomModule { }
