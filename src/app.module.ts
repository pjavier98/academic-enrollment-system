import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DepartmentsModule } from './departments/departments.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SecretariatsModule } from './secretariats/secretariats.module';
import { TeachersModule } from './teachers/teachers.module';

@Module({
  imports: [DepartmentsModule, SecretariatsModule, TypeOrmModule.forRoot(), TeachersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
