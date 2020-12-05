import { PartialType } from '@nestjs/mapped-types';
import { IsNumber } from 'class-validator';
import { CreateEnrolledSubjectDto } from './create-enrolled-subject.dto';

export class UpdateEnrolledSubjectGradeDto extends PartialType(
  CreateEnrolledSubjectDto,
) {
  @IsNumber()
  grade: number;
}
