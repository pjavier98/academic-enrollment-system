import { IsEmail, IsString } from 'class-validator';

export class CreateStudentDto {
  @IsString()
  readonly name: string;

  @IsString()
  @IsEmail()
  readonly email: string;

  @IsString()
  readonly departmentId: string;

  @IsString()
  readonly enrollmentNumber: string;
}
