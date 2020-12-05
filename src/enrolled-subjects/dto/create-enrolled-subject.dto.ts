import { IsString } from 'class-validator';

export class CreateEnrolledSubjectDto {
  @IsString()
  readonly subjectId: string;

  @IsString()
  readonly studentId: string;
}
