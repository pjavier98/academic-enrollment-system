import { Module } from '@nestjs/common';
import { DepartmentsModule } from './departments/departments.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SecretariatsModule } from './secretariats/secretariats.module';
import { TeachersModule } from './teachers/teachers.module';
import { StudentsModule } from './students/students.module';
import { SubjectsModule } from './subjects/subjects.module';
import { EnrolledSubjectsModule } from './enrolled-subjects/enrolled-subjects.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(),
    DepartmentsModule,
    SecretariatsModule,
    StudentsModule,
    TeachersModule,
    SubjectsModule,
    EnrolledSubjectsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
