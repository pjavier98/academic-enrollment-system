import { Controller, Get, Post, Body } from '@nestjs/common';
import { SecretariatsService } from './secretariats.service';
import { CreateSecretariatDto } from './dto/create-secretariat.dto';

@Controller('secretariats')
export class SecretariatsController {
  constructor(private readonly secretariatsService: SecretariatsService) {}

  @Post()
  create(@Body() createSecretariatDto: CreateSecretariatDto) {
    return this.secretariatsService.create(createSecretariatDto);
  }

  @Get()
  findAll() {
    return this.secretariatsService.findAll();
  }
}
