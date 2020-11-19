import { PartialType } from '@nestjs/mapped-types';
import { CreateSecretariatDto } from './create-secretariat.dto';

export class UpdateSecretariatDto extends PartialType(CreateSecretariatDto) {}
