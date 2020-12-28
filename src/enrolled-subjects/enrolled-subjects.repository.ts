import { EnrolledSubject } from './entities/enrolled-subject.entity';
import { EntityRepository, Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

@EntityRepository(EnrolledSubject)
export class EnrolledSubjectRepository extends Repository<EnrolledSubject> {
  findOneEnrolledSubject = async (id: string) => {
    const enrolledSubject = await this.findOne(id, {
      relations: ['subject', 'student'],
    });

    if (!enrolledSubject) {
      throw new NotFoundException(`Enrolled Subject #${id} not found`);
    }

    return enrolledSubject;
  };
}
