import { IsString } from 'class-validator';

export class CreateStudentDto {
  @IsString()
  readonly name: string;

  @IsString()
  readonly email: string;

  @IsString()
  readonly departmentId: string;
}
