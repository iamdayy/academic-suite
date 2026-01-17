import { PartialType } from '@nestjs/mapped-types';
import { CreateGradingDto } from './create-grading.dto';

export class UpdateGradingDto extends PartialType(CreateGradingDto) {}
