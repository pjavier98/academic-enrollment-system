import { IsEnum, IsString } from 'class-validator';

import { SecretariatType } from '../entities/secretariat.entity';

export class CreateSecretariatDto {
  @IsEnum(SecretariatType)
  type: SecretariatType;

  @IsString()
  readonly departmentId: string;
}
