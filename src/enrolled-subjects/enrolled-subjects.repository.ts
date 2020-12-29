import { EnrolledSubject } from './entities/enrolled-subject.entity';
import { EntityRepository, Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

@EntityRepository(EnrolledSubject)
export class EnrolledSubjectRepository extends Repository<EnrolledSubject> {
  async findOneEnrolledSubject(id: string) {
    const enrolledSubject = await this.findOne(id, {
      relations: ['subject', 'student'],
    });

    if (!enrolledSubject) {
      throw new NotFoundException(`Enrolled Subject #${id} not found`);
    }

    return enrolledSubject;
  }

  async findStudentCredits(studentId: string): Promise<number> {
    const subjects = await this.find({
      relations: ['subject', 'student'],
      where: {
        student: studentId,
        isApproved: true,
      },
    });

    const studentCredits = subjects.reduce(
      (credits, subject) => credits + subject.subject.credits_number,
      0,
    );

    return studentCredits;
  }

  async findSubjectPrerequisites(
    studentId: string,
    subjectId: string,
  ): Promise<EnrolledSubject> {
    const prerequisiteSubject = await this.findOne({
      relations: ['subject', 'student'],
      where: {
        student: studentId,
        subject: subjectId,
      },
    });

    console.log(prerequisiteSubject);

    return prerequisiteSubject;
  }
}
