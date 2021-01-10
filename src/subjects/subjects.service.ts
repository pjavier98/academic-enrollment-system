import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Secretariat } from '../secretariats/entities/secretariat.entity';
import { Teacher } from '../teachers/entities/teacher.entity';
import { Like, Repository } from 'typeorm';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
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

    const subject = this.subjectRepository.create(createSubjectDto);
    subject.secretariat = secretariatExist;
    subject.teacher = teacherExist;

    if (prerequisites.length > 0) {
      subject.prerequisites = prerequisites;
    }

    return this.subjectRepository.save(subject);
  }

  findAll() {
    return `This action returns all subjects`;
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

  update(id: number, updateSubjectDto: UpdateSubjectDto) {
    return `This action updates a #${id} subject`;
  }

  remove(id: number) {
    return `This action removes a #${id} subject`;
  }
}
