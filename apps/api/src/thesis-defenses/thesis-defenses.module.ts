import { Module } from '@nestjs/common';
import { ThesisDefensesService } from './thesis-defenses.service';
import { ThesisDefensesController } from './thesis-defenses.controller';

@Module({
  controllers: [ThesisDefensesController],
  providers: [ThesisDefensesService],
})
export class ThesisDefensesModule {}
