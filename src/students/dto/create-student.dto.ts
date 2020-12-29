import { IsEmail, IsString, IsEnum } from 'class-validator';
import { StudentType } from '../entities/student.entity';

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

  @IsEnum(StudentType)
  type: StudentType;
}
