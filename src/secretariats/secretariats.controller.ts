import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import { SecretariatsService } from './secretariats.service';
import { CreateSecretariatDto } from './dto/create-secretariat.dto';
import { UpdateSecretariatDto } from './dto/update-secretariat.dto';

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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.secretariatsService.findOne(+id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateSecretariatDto: UpdateSecretariatDto,
  ) {
    return this.secretariatsService.update(+id, updateSecretariatDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.secretariatsService.remove(+id);
  }
}
