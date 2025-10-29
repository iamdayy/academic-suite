import { PartialType } from '@nestjs/mapped-types';
import { CreateAssignmentSubmissionDto } from './create-assignment-submission.dto';

export class UpdateAssignmentSubmissionDto extends PartialType(CreateAssignmentSubmissionDto) {}
