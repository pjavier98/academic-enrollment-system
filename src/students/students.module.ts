import { Module } from '@nestjs/common';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from './entities/student.entity';
import { DepartmentsModule } from 'src/departments/departments.module';

@Module({
  imports: [TypeOrmModule.forFeature([Student]), DepartmentsModule],
  controllers: [StudentsController],
  providers: [StudentsService],
})
export class StudentsModule {}
