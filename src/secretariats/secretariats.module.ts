import { Module } from '@nestjs/common';
import { SecretariatsService } from './secretariats.service';
import { SecretariatsController } from './secretariats.controller';
import { Secretariat } from './entities/secretariat.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Secretariat])],
  controllers: [SecretariatsController],
  providers: [SecretariatsService],
})
export class SecretariatsModule {}
