import { PartialType } from '@nestjs/mapped-types';
import { EnrollStudentDto } from './create-class-enrollment.dto';

export class UpdateClassEnrollmentDto extends PartialType(EnrollStudentDto) {}
