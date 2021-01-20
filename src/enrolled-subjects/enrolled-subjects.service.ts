import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Student } from '../students/entities/student.entity';
import { Subject } from '../subjects/entities/subject.entity';
import { Repository } from 'typeorm';
import { CreateEnrolledSubjectDto } from './dto/create-enrolled-subject.dto';
import { UpdateEnrolledSubjectGradeDto } from './dto/update-enrolled-subject-grade.dto';
import { UpdateEnrolledSubjectDto } from './dto/update-enrolled-subject.dto';
import { EnrolledSubjectRepository } from './enrolled-subjects.repository';
import { EnrolledSubject } from './entities/enrolled-subject.entity';
import { CREDITS_TO_ENROLL_POS_GRADUATION_SUBJECT_FOR_GRADUATION_STUDENT } from '../constants/enoughCreditsToEnrollPosGraduationSubjectForGraduationStudent';

@Injectable()
export class EnrolledSubjectsService {
  constructor(
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,

    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,

    @InjectRepository(EnrolledSubjectRepository)
    private readonly enrolledSubjectRepository: EnrolledSubjectRepository,
  ) {}

  enrolledStudentInADifferentDepartmentThatHisCourse = (
    student: Student,
    subject: Subject,
  ) => {
    const subjectDepartment = subject.secretariat.department;
    const studentDepartment = student.department;

    const isSameDepartment = subjectDepartment.name === studentDepartment.name;

    if (!isSameDepartment) {
      throw new BadRequestException(
        'Não foi possível matricular o aluno',
        `O/a aluno/a pertence ao departamento ${studentDepartment.name} e a matéria ao departamento ${subjectDepartment.name}`,
      );
    }
  };

  enrolledStudentInASubjectWithInsufficientCredits = async (
    student: Student,
    subject: Subject,
  ) => {
    const studentCredits = await this.enrolledSubjectRepository.findStudentCredits(
      student.id,
    );

    const hasEnoughCreditsToEnrollTheSubject =
      studentCredits >= subject.minimum_credits_number_to_attend;

    if (!hasEnoughCreditsToEnrollTheSubject) {
      throw new BadRequestException(
        'Não foi possível matricular o aluno',
        `O/a aluno/a ${student.name} não possui créditos suficientes para cursar a matéria ${subject.name}`,
      );
    }
  };

  enrolledStudentInASubjectWithoutItsPrerequisites = async (
    student: Student,
    subject: Subject,
  ) => {
    const { prerequisites } = subject;

    const hasPrerequisites = prerequisites.length > 0;
    const prerequisitesIds = prerequisites.map(
      (prerequisite) => prerequisite.id,
    );

    let enrolledSubjects: EnrolledSubject[];

    if (hasPrerequisites) {
      enrolledSubjects = await this.enrolledSubjectRepository.findSubjectPrerequisites(
        student.id,
        prerequisitesIds,
      );

      const subjectPrerequisitesIds = enrolledSubjects.map(
        (subjectPrerequisite) => subjectPrerequisite.subject.id,
      );

      const prerequisitesNotEnrolled = prerequisites
        .filter(
          (prerequisite) => !subjectPrerequisitesIds.includes(prerequisite.id),
        )
        .map((prerequisite) => prerequisite.name)
        .join(', ');

      const passedInAllPrerequisites =
        subject.prerequisites.length === enrolledSubjects.length;

      if (!passedInAllPrerequisites) {
        throw new BadRequestException(
          'Não foi possível matricular o aluno',
          `O/a aluno/a ${student.name} não pagou todos o/s pre-requisitos [${prerequisitesNotEnrolled}] para cursar a matéria ${subject.name}`,
        );
      }
    }
  };

  enrolledStudentInASubjectHeAlreadyPassed = async (
    student: Student,
    subject: Subject,
  ) => {
    const subjectAlreadyPassed = await this.enrolledSubjectRepository.findOne(
      subject.id,
      {
        where: {
          isApproved: true,
        },
      },
    );

    const alreadyPassedInSubject = !!subjectAlreadyPassed;

    if (alreadyPassedInSubject) {
      throw new BadRequestException(
        'Não foi possível matricular o aluno',
        `O/a aluno/a ${student.name} já cursou ${subject.name} e passou na matéria`,
      );
    }
  };

  enrolledGraduationStudentInPosGraduationSubjectWithInsufficientCredits = async (
    student: Student,
    subject: Subject,
  ) => {
    const isGraduationStudent = student.type === 'graduation';
    const isPosGraduationSubject =
      subject.secretariat.type === 'pos_graduation';

    if (isGraduationStudent && isPosGraduationSubject) {
      const studentCredits = await this.enrolledSubjectRepository.findStudentCredits(
        student.id,
      );

      const hasEnoughCreditsToEnrollTheSubject =
        studentCredits >=
        CREDITS_TO_ENROLL_POS_GRADUATION_SUBJECT_FOR_GRADUATION_STUDENT;

      if (!hasEnoughCreditsToEnrollTheSubject) {
        throw new BadRequestException(
          'Não foi possível matricular o aluno',
          `O/a aluno/a ${student.name} precisa de pelo menos 170 créditos para cursar a matéria de pos-graduação ${subject.name}`,
        );
      }
    }
  };

  enrolledPosGraduationStudentInGraduationSubject = (
    student: Student,
    subject: Subject,
  ) => {
    const isPosGraduationStudent = student.type === 'pos_graduation';
    const isGraduationSubject = subject.secretariat.type === 'graduation';

    if (isPosGraduationStudent && isGraduationSubject) {
      throw new BadRequestException(
        'Não foi possível matricular o aluno',
        `O aluno/a ${student.name} de pos-graduação não pode se matricular em matérias de graduação`,
      );
    }
  };

  async create(createEnrolledSubjectDto: CreateEnrolledSubjectDto) {
    const { subjectId, studentId } = createEnrolledSubjectDto;

    const subjectExist = await this.subjectRepository.findOne(subjectId, {
      relations: ['secretariat', 'secretariat.department', 'prerequisites'],
    });

    if (!subjectExist) {
      throw new NotFoundException(`Subject #${subjectId} not found`);
    }

    const studentExist = await this.studentRepository.findOne(studentId, {
      relations: ['department'],
    });

    if (!studentExist) {
      throw new NotFoundException(`Student #${studentId} not found`);
    }

    await Promise.all([
      // O aluno só pode se matricular em matéria do departamento ao qual seu curso pertence
      this.enrolledStudentInADifferentDepartmentThatHisCourse(
        studentExist,
        subjectExist,
      ),
      // A matrícula so deve ser concretizada se o aluno cumpriu o número de crédito mínimo
      this.enrolledStudentInASubjectWithInsufficientCredits(
        studentExist,
        subjectExist,
      ),
      // A matrícula so deve ser concretizada se o aluno já pagou as matérias de pre-requisito
      this.enrolledStudentInASubjectWithoutItsPrerequisites(
        studentExist,
        subjectExist,
      ),
      // O aluno não pode se matrícular em matérias que ele já tenha cursado e passado
      this.enrolledStudentInASubjectHeAlreadyPassed(studentExist, subjectExist),
      // O aluno de graduação pode se matricular em materias de pos-graduação somente se tiver completado pelo menos 170 créditos
      this.enrolledGraduationStudentInPosGraduationSubjectWithInsufficientCredits(
        studentExist,
        subjectExist,
      ),
      // Os alunos de pós-graduação não podem cursar disciplinas de graduação
      this.enrolledPosGraduationStudentInGraduationSubject(
        studentExist,
        subjectExist,
      ),
    ]);

    const enrolledSubject = this.enrolledSubjectRepository.create({
      ...createEnrolledSubjectDto,
      subject: subjectExist,
      student: studentExist,
    });

    return this.enrolledSubjectRepository.save(enrolledSubject);
  }

  findOne(id: string) {
    return this.enrolledSubjectRepository.findOneEnrolledSubject(id);
  }

  async updateGrade(
    id: string,
    updateEnrolledSubjectGradeDto: UpdateEnrolledSubjectGradeDto,
  ) {
    const { grade } = updateEnrolledSubjectGradeDto;

    let isApproved = false;

    if (grade >= 7) {
      isApproved = true;
    }

    await this.enrolledSubjectRepository.update(id, {
      ...updateEnrolledSubjectGradeDto,
      isApproved,
    });

    return this.enrolledSubjectRepository.findOne(id, {
      relations: ['student', 'subject'],
    });
  }
}
