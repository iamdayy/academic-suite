import { Module } from '@nestjs/common';
import { GuardianViewService } from './guardian-view.service';
import { GuardianViewController } from './guardian-view.controller';

@Module({
  providers: [GuardianViewService],
  controllers: [GuardianViewController]
})
export class GuardianViewModule {}
