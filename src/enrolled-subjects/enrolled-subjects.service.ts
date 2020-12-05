import { Injectable } from '@nestjs/common';
import { CreateEnrolledSubjectDto } from './dto/create-enrolled-subject.dto';
import { UpdateEnrolledSubjectDto } from './dto/update-enrolled-subject.dto';

@Injectable()
export class EnrolledSubjectsService {
  create(createEnrolledSubjectDto: CreateEnrolledSubjectDto) {
    return 'This action adds a new enrolledSubject';
  }

  findAll() {
    return `This action returns all enrolledSubjects`;
  }

  findOne(id: number) {
    return `This action returns a #${id} enrolledSubject`;
  }

  update(id: number, updateEnrolledSubjectDto: UpdateEnrolledSubjectDto) {
    return `This action updates a #${id} enrolledSubject`;
  }

  remove(id: number) {
    return `This action removes a #${id} enrolledSubject`;
  }
}