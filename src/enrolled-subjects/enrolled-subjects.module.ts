import { Module } from '@nestjs/common';
import { EnrolledSubjectsService } from './enrolled-subjects.service';
import { EnrolledSubjectsController } from './enrolled-subjects.controller';

@Module({
  controllers: [EnrolledSubjectsController],
  providers: [EnrolledSubjectsService]
})
export class EnrolledSubjectsModule {}
