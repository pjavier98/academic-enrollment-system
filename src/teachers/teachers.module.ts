import { Module } from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { TeachersController } from './teachers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Teacher } from './entities/teacher.entity';
import { DepartmentsModule } from 'src/departments/departments.module';
import { Department } from 'src/departments/entities/department.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Teacher, Department]), DepartmentsModule],
  controllers: [TeachersController],
  providers: [TeachersService],
})
export class TeachersModule {}
