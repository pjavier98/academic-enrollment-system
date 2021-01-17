import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Secretariat } from '../secretariats/entities/secretariat.entity';
import { Teacher } from '../teachers/entities/teacher.entity';
import { Repository } from 'typeorm';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { Subject } from './entities/subject.entity';

@Injectable()
export class SubjectsService {
  constructor(
    @InjectRepository(Secretariat)
    private readonly secretariatRepository: Repository<Secretariat>,

    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,

    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,
  ) {}

  async create(createSubjectDto: CreateSubjectDto) {
    const { secretariatId, teacherId, subjectIds, code } = createSubjectDto;

    const subjectWithSameCode = await this.subjectRepository.findOne({
      where: {
        code,
      },
    });

    if (subjectWithSameCode) {
      throw new NotFoundException(`Already exist a subject with same code`);
    }

    const secretariatExist = await this.secretariatRepository.findOne(
      secretariatId,
    );

    if (!secretariatExist) {
      throw new NotFoundException(`Secretariat #${secretariatId} not found`);
    }

    const teacherExist = await this.teacherRepository.findOne(teacherId);

    if (!teacherExist) {
      throw new NotFoundException(`Teacher #${teacherId} not found`);
    }

    const prerequisites: Subject[] = [];

    if (subjectIds) {
      const subjectExistsPromises = subjectIds.map(async (subjectId) => {
        const subjectExist = await this.subjectRepository.findOne(subjectId);

        if (!subjectExist) {
          throw new NotFoundException(`Subject #${subjectId} not found`);
        }

        prerequisites.push(subjectExist);
      });

      await Promise.all(subjectExistsPromises);
    }

    const subject = this.subjectRepository.create({
      ...createSubjectDto,
      secretariat: secretariatExist,
      teacher: teacherExist,
      prerequisites,
    });

    return this.subjectRepository.save(subject);
  }

  async findOne(id: string) {
    const subject = await this.subjectRepository.findOne(id, {
      relations: [
        'prerequisites',
        'teacher',
        'enrolledSubjects',
        'enrolledSubjects.student',
      ],
      select: ['name', 'code', 'credits_number'],
    });

    if (!subject) {
      throw new NotFoundException(`Subject #${id} not found`);
    }

    const {
      prerequisites,
      teacher,
      enrolledSubjects,
      ...subjectData
    } = subject;

    const parsedPrerequistes = prerequisites.map((prerequisite) => ({
      name: prerequisite.name,
      code: prerequisite.code,
    }));

    const parsedTeacher = {
      name: teacher.name,
    };

    const parsedEnrolledSubjects = enrolledSubjects.map((enrolledSubject) => ({
      name: enrolledSubject.student.name,
      enrollmentNumber: enrolledSubject.student.enrollmentNumber,
    }));

    const parsedSubject = {
      ...subjectData,
      teacher: parsedTeacher,
      enrolledStudents: parsedEnrolledSubjects,
      prerequisites: parsedPrerequistes,
    };

    return parsedSubject;
  }
}
