import { Module } from '@nestjs/common';
import { SecretariatsService } from './secretariats.service';
import { SecretariatsController } from './secretariats.controller';
import { Secretariat } from './entities/secretariat.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Department } from '../departments/entities/department.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Secretariat, Department])],
  controllers: [SecretariatsController],
  providers: [SecretariatsService],
})
export class SecretariatsModule {}
