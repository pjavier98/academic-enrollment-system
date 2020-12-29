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
import { ENOUGH_CREDITS_TO_ENROLL_POS_GRADUATION_SUBJECT_FOR_GRADUATION_STUDENT } from 'src/constants/enoughCreditsToEnrollPosGraduationSubjectForGraduationStudent';

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

  async canStudentBeEnrolledInTheSubject(subject: Subject, student: Student) {
    const enrolledStudentInADifferentDepartmentThatHisCourse = () => {
      const subjectDepartment = subject.secretariat.department;
      const studentDepartment = student.department;

      const isSameDepartment =
        subjectDepartment.name === studentDepartment.name &&
        subjectDepartment.id === studentDepartment.id;

      if (!isSameDepartment) {
        throw new BadRequestException(
          'Não foi possível matricular o aluno',
          `O aluno/a pertence ao departamento ${studentDepartment.name} e a matéria ao departamento ${subjectDepartment.name}`,
        );
      }
    };

    const enrolledStudentInASubjectWithInsufficientCredits = async () => {
      // get the credits of the subjects the student already passed
      const studentCredits = await this.enrolledSubjectRepository.findStudentCredits(
        student.id,
      );

      const hasEnoughCreditsToEnrollTheSubject =
        studentCredits >= subject.minimum_credits_number_to_attend;

      if (!hasEnoughCreditsToEnrollTheSubject) {
        throw new BadRequestException(
          'Não foi possível matricular o aluno',
          `O aluno/a ${student.name} não possui créditos suficientes para cursar a matéria ${subject.name}`,
        );
      }
    };

    const enrolledStudentInASubjectWithoutItsPrerequisites = async () => {
      const hasPrerequisites = !!subject.prequisiteSubject;

      console.log(subject.prequisiteSubject);

      let prerequisiteSubject: EnrolledSubject;

      if (hasPrerequisites) {
        prerequisiteSubject = await this.enrolledSubjectRepository.findSubjectPrerequisites(
          student.id,
          subject.prequisiteSubject.id,
        );
      }

      const passedInThePrequisitesSubject = prerequisiteSubject?.isApproved;

      if (!passedInThePrequisitesSubject) {
        throw new BadRequestException(
          'Não foi possível matricular o aluno',
          `O aluno/a ${student.name} não pagou o pre-requisito ${subject.prequisiteSubject.name} para cursar a matéria ${subject.name}`,
        );
      }
    };

    const enrolledStudentInASubjectHeAlreadyPassed = () => {
      const subjectAlreadyPassed = this.enrolledSubjectRepository.findOne(
        subject.id,
        {
          where: {
            isApproved: true,
          },
        },
      );

      if (subjectAlreadyPassed) {
        throw new BadRequestException(
          'Não foi possível matricular o aluno',
          `O aluno/a ${student.name} já cursou e passou na matéria ${subject.name}`,
        );
      }
    };

    const enrolledGraduationStudentInPosGraduationSubjectWithInsufficientCredits = async () => {
      const isGraduationStudent = student.type === 'graduation';
      const isPosGraduationSubject =
        subject.secretariat.type === 'pos_graduation';

      if (isGraduationStudent && isPosGraduationSubject) {
        const studentCredits = await this.enrolledSubjectRepository.findStudentCredits(
          student.id,
        );

        const hasEnoughCreditsToEnrollTheSubject =
          studentCredits >=
          ENOUGH_CREDITS_TO_ENROLL_POS_GRADUATION_SUBJECT_FOR_GRADUATION_STUDENT;

        if (!hasEnoughCreditsToEnrollTheSubject) {
          throw new BadRequestException(
            'Não foi possível matricular o aluno',
            `O aluno/a ${student.name} precisa de pelo menos 170 créditos para cursar a matéria de pos-graduação ${subject.name}`,
          );
        }
      }
    };

    const enrolledPosGraduationStudentInGraduationSubject = () => {
      const isPosGraduationStudent = student.type === 'pos_graduation';
      const isGraduationSubject = subject.secretariat.type === 'graduation';

      if (isPosGraduationStudent && isGraduationSubject) {
        throw new BadRequestException(
          'Não foi possível matricular o aluno',
          `O aluno/a ${student.name} de pos-graduação não pode se matricular em matérias de graduação`,
        );
      }
    };

    await Promise.all([
      // O aluno só pode se matricular em matéria do departamento ao qual seu curso pertence
      enrolledStudentInADifferentDepartmentThatHisCourse(),
      // A matrícula so deve ser concretizada se o aluno cumpriu o número de crédito mínimo
      enrolledStudentInASubjectWithInsufficientCredits(),
      // A matrícula so deve ser concretizada se o aluno já pagou as matérias de pre-requisito
      enrolledStudentInASubjectWithoutItsPrerequisites(),
      // O aluno não pode se matrícular em matérias que ele já tenha cursado e passado
      enrolledStudentInASubjectHeAlreadyPassed(),
      // O aluno de graduação pode se matricular em materias de pos-graduação somente se tiver completado pelo menos 170 créditos
      enrolledGraduationStudentInPosGraduationSubjectWithInsufficientCredits(),
      // Os alunos de pós-graduação não podem cursar disciplinas de graduação
      enrolledPosGraduationStudentInGraduationSubject(),
    ]);
  }

  async create(createEnrolledSubjectDto: CreateEnrolledSubjectDto) {
    const { subjectId, studentId } = createEnrolledSubjectDto;

    const subjectExist = await this.subjectRepository.findOne(subjectId, {
      relations: ['secretariat', 'secretariat.department', 'prequisiteSubject'],
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

    await this.canStudentBeEnrolledInTheSubject(subjectExist, studentExist);

    const enrolledSubject = this.enrolledSubjectRepository.create({
      ...createEnrolledSubjectDto,
      subject: subjectExist,
      student: studentExist,
    });

    return this.enrolledSubjectRepository.save(enrolledSubject);
  }

  findAll() {
    return `This action returns all enrolledSubjects`;
  }

  findOne(id: string) {
    try {
      return this.enrolledSubjectRepository.findOneEnrolledSubject(id);
    } catch (error) {
      console.log(error);
    }
  }

  updateGrade(
    id: string,
    updateEnrolledSubjectGradeDto: UpdateEnrolledSubjectGradeDto,
  ) {
    return `This action updates the grade #${id} enrolledSubject`;
  }

  update(id: string, updateEnrolledSubjectDto: UpdateEnrolledSubjectDto) {
    return `This action updates a #${id} enrolledSubject`;
  }

  remove(id: string) {
    return `This action removes a #${id} enrolledSubject`;
  }
}
