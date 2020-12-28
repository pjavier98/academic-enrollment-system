import { Module } from '@nestjs/common';
import { EnrolledSubjectsService } from './enrolled-subjects.service';
import { EnrolledSubjectsController } from './enrolled-subjects.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subject } from '../subjects/entities/subject.entity';
import { Student } from '../students/entities/student.entity';
import { EnrolledSubject } from './entities/enrolled-subject.entity';
import { EnrolledSubjectRepository } from './enrolled-subjects.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Subject,
      Student,
      EnrolledSubject,
      EnrolledSubjectRepository,
    ]),
  ],
  controllers: [EnrolledSubjectsController],
  providers: [EnrolledSubjectsService],
})
export class EnrolledSubjectsModule {}
