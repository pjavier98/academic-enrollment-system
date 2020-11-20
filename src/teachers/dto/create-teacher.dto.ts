import { IsString } from 'class-validator';

export class CreateTeacherDto {
  @IsString()
  readonly name: string;

  @IsString()
  readonly email: string;

  @IsString()
  readonly departmentId: string;
}
