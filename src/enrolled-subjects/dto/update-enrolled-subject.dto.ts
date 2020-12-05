import { PartialType } from '@nestjs/mapped-types';
import { CreateEnrolledSubjectDto } from './create-enrolled-subject.dto';

export class UpdateEnrolledSubjectDto extends PartialType(CreateEnrolledSubjectDto) {}
