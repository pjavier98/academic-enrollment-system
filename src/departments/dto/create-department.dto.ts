import { IsString } from 'class-validator';

export class CreateDepartmentDto {
  @IsString()
  readonly name: string;
}
