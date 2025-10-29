import { Module } from '@nestjs/common';
import { ClassEnrollmentController } from './class-enrollments.controller';
import { ClassEnrollmentService } from './class-enrollments.service';

@Module({
  controllers: [ClassEnrollmentController],
  providers: [ClassEnrollmentService],
})
export class ClassEnrollmentsModule {}
