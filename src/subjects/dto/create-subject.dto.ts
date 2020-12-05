import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateSubjectDto {
  @IsString()
  readonly name: string;

  @IsString()
  readonly code: string;

  @IsNumber()
  readonly credits_number: number;

  @IsNumber()
  readonly minimum_credits_number_to_attend: number;

  @IsString()
  readonly secretariatId: string;

  @IsString()
  readonly teacherId: string;

  @IsString()
  @IsOptional()
  readonly subjectId: string;
}
