import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DepartmentsModule } from './departments/departments.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SecretariatsModule } from './secretariats/secretariats.module';

@Module({
  imports: [DepartmentsModule, SecretariatsModule, TypeOrmModule.forRoot()],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
