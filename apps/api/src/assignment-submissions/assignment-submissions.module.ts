import { Module } from '@nestjs/common';
import { AssignmentSubmissionsService } from './assignment-submissions.service';
import { AssignmentSubmissionsController } from './assignment-submissions.controller';

@Module({
  controllers: [AssignmentSubmissionsController],
  providers: [AssignmentSubmissionsService],
})
export class AssignmentSubmissionsModule {}
