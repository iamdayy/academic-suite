import { Module } from '@nestjs/common';
import { PrerequisitesService } from './prerequisites.service';
import { PrerequisitesController } from './prerequisites.controller';

@Module({
  providers: [PrerequisitesService],
  controllers: [PrerequisitesController]
})
export class PrerequisitesModule {}
