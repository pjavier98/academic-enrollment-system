import { Module } from '@nestjs/common';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from './entities/student.entity';
import { DepartmentsModule } from 'src/departments/departments.module';
import { Department } from 'src/departments/entities/department.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Student, Department]), DepartmentsModule],
  controllers: [StudentsController],
  providers: [StudentsService],
})
export class StudentsModule {}
