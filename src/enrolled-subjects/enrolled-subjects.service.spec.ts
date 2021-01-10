import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getCustomRepositoryToken, getRepositoryToken } from '@nestjs/typeorm';
import { Student } from '../students/entities/student.entity';
import { Subject } from '../subjects/entities/subject.entity';
import { Repository } from 'typeorm';
import { EnrolledSubjectsService } from './enrolled-subjects.service';
import { EnrolledSubjectRepository } from './enrolled-subjects.repository';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const createMockRepository = <T = any>(): MockRepository<T> => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

const enrolledSubjectsMockRepository = (): any => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  findStudentCredits: jest.fn(),
  findSubjectPrerequisites: jest.fn(),
});

const enrolledSubjectsMocks = {
  valid: require('../../test/mocks/enrolled-subjects/enrolled-subject-valid.json'),
  subject: require('../../test/mocks/enrolled-subjects/subject.json'),
  student: require('../../test/mocks/enrolled-subjects/student.json'),
  posGraduationStudent: require('../../test/mocks/enrolled-subjects/pos-graduation-student.json'),
};

const subjectsMocks = {
  valid: require('../../test/mocks/subjects/subject-valid.json'),
};

const studentMocks = {
  valid: require('../../test/mocks/students/student-valid.json'),
};

const enrolledStudentUseCases = [
  'enrolledStudentInADifferentDepartmentThatHisCourse',
  'enrolledStudentInASubjectWithInsufficientCredits',
  'enrolledStudentInASubjectWithoutItsPrerequisites',
  'enrolledStudentInASubjectHeAlreadyPassed',
  'enrolledGraduationStudentInPosGraduationSubjectWithInsufficientCredits',
  'enrolledPosGraduationStudentInGraduationSubject',
];

describe('EnrolledSubjectsService', () => {
  let enrolledSubjectsService: EnrolledSubjectsService;

  let enrolledSubjectsRepository: EnrolledSubjectRepository;
  let subjectRepository: MockRepository;
  let studentRepository: MockRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnrolledSubjectsService,
        {
          provide: getRepositoryToken(Subject),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(Student),
          useValue: createMockRepository(),
        },
        {
          provide: getCustomRepositoryToken(EnrolledSubjectRepository),
          useValue: enrolledSubjectsMockRepository(),
        },
      ],
    }).compile();

    enrolledSubjectsService = module.get<EnrolledSubjectsService>(
      EnrolledSubjectsService,
    );

    enrolledSubjectsRepository = module.get<EnrolledSubjectRepository>(
      getCustomRepositoryToken(EnrolledSubjectRepository),
    );

    subjectRepository = module.get<MockRepository>(getRepositoryToken(Subject));

    studentRepository = module.get<MockRepository>(getRepositoryToken(Student));
  });

  it('should be defined', () => {
    expect(enrolledSubjectsService).toBeDefined();

    expect(enrolledSubjectsRepository).toBeDefined();
    expect(subjectRepository).toBeDefined();
    expect(studentRepository).toBeDefined();
  });

  describe('create', () => {
    it('should not be able to enroll a non-existent subject', async () => {
      try {
        jest.spyOn(subjectRepository, 'findOne').mockReturnValue(undefined);
        await enrolledSubjectsService.create(enrolledSubjectsMocks.valid);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });

    it('should not be able to enroll a subject with a non-existent student', async () => {
      try {
        jest
          .spyOn(subjectRepository, 'findOne')
          .mockReturnValue(subjectsMocks.valid);
        jest.spyOn(studentRepository, 'findOne').mockReturnValue(undefined);
        await enrolledSubjectsService.create(enrolledSubjectsMocks.valid);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });

    it('should only be able to enroll a student in subjects from his department', async () => {
      try {
        jest
          .spyOn(subjectRepository, 'findOne')
          .mockReturnValue(enrolledSubjectsMocks.subject);

        jest
          .spyOn(studentRepository, 'findOne')
          .mockReturnValue(enrolledSubjectsMocks.student);

        jest
          .spyOn(
            enrolledSubjectsService,
            'enrolledStudentInASubjectWithInsufficientCredits',
          )
          .mockImplementation();

        await enrolledSubjectsService.create(enrolledSubjectsMocks.valid);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should only be able to enroll a student in a subject without fulfilled the minimum credit number', async () => {
      try {
        const currentUseCase =
          'enrolledStudentInASubjectWithInsufficientCredits';

        const insufficientCredits = 0;

        jest
          .spyOn(subjectRepository, 'findOne')
          .mockReturnValue(enrolledSubjectsMocks.subject);

        jest
          .spyOn(studentRepository, 'findOne')
          .mockReturnValue(enrolledSubjectsMocks.student);

        enrolledStudentUseCases.forEach(
          (enrolledStudentUseCase: keyof EnrolledSubjectsService) => {
            if (enrolledStudentUseCase !== currentUseCase) {
              jest
                .spyOn(enrolledSubjectsService, enrolledStudentUseCase)
                .mockImplementation();
            }
          },
        );

        jest
          .spyOn(enrolledSubjectsRepository, 'findStudentCredits')
          .mockResolvedValue(insufficientCredits);

        await enrolledSubjectsService.create(enrolledSubjectsMocks.valid);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should not be able to enroll a student in a subject without passed in its prerequisites', async () => {
      try {
        const currentUseCase =
          'enrolledStudentInASubjectWithoutItsPrerequisites';

        jest
          .spyOn(subjectRepository, 'findOne')
          .mockReturnValue(enrolledSubjectsMocks.subject);

        jest
          .spyOn(studentRepository, 'findOne')
          .mockReturnValue(enrolledSubjectsMocks.student);

        enrolledStudentUseCases.forEach(
          (enrolledStudentUseCase: keyof EnrolledSubjectsService) => {
            if (enrolledStudentUseCase !== currentUseCase) {
              jest
                .spyOn(enrolledSubjectsService, enrolledStudentUseCase)
                .mockImplementation();
            }
          },
        );

        jest
          .spyOn(enrolledSubjectsRepository, 'findSubjectPrerequisites')
          .mockResolvedValue([]);

        await enrolledSubjectsService.create(enrolledSubjectsMocks.valid);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should not be able to enroll a student in a subject he/she already passed', async () => {
      try {
        const currentUseCase = 'enrolledStudentInASubjectHeAlreadyPassed';

        jest
          .spyOn(subjectRepository, 'findOne')
          .mockReturnValue(enrolledSubjectsMocks.subject);

        jest
          .spyOn(studentRepository, 'findOne')
          .mockReturnValue(enrolledSubjectsMocks.student);

        enrolledStudentUseCases.forEach(
          (enrolledStudentUseCase: keyof EnrolledSubjectsService) => {
            if (enrolledStudentUseCase !== currentUseCase) {
              jest
                .spyOn(enrolledSubjectsService, enrolledStudentUseCase)
                .mockImplementation();
            }
          },
        );

        jest
          .spyOn(enrolledSubjectsRepository, 'findOne')
          .mockResolvedValue(enrolledSubjectsMocks.subject);

        await enrolledSubjectsService.create(enrolledSubjectsMocks.valid);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should not be able to enroll a student of graduation in a pos-graduation subject without enough credits (170)', async () => {
      try {
        const currentUseCase =
          'enrolledGraduationStudentInPosGraduationSubjectWithInsufficientCredits';

        const insufficientCreditsForPosGraduationSubject = 0;

        jest
          .spyOn(subjectRepository, 'findOne')
          .mockReturnValue(enrolledSubjectsMocks.subject);

        jest
          .spyOn(studentRepository, 'findOne')
          .mockReturnValue(enrolledSubjectsMocks.student);

        enrolledStudentUseCases.forEach(
          (enrolledStudentUseCase: keyof EnrolledSubjectsService) => {
            if (enrolledStudentUseCase !== currentUseCase) {
              jest
                .spyOn(enrolledSubjectsService, enrolledStudentUseCase)
                .mockImplementation();
            }
          },
        );

        jest
          .spyOn(enrolledSubjectsRepository, 'findStudentCredits')
          .mockResolvedValue(insufficientCreditsForPosGraduationSubject);

        await enrolledSubjectsService.create(enrolledSubjectsMocks.valid);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should not be able to enroll a student of pos-graduation in a graduation subject', async () => {
      try {
        const currentUseCase =
          'enrolledPosGraduationStudentInGraduationSubject';

        jest
          .spyOn(subjectRepository, 'findOne')
          .mockReturnValue(enrolledSubjectsMocks.subject);

        jest
          .spyOn(studentRepository, 'findOne')
          .mockReturnValue(enrolledSubjectsMocks.posGraduationStudent);

        enrolledStudentUseCases.forEach(
          (enrolledStudentUseCase: keyof EnrolledSubjectsService) => {
            if (enrolledStudentUseCase !== currentUseCase) {
              jest
                .spyOn(enrolledSubjectsService, enrolledStudentUseCase)
                .mockImplementation();
            }
          },
        );

        await enrolledSubjectsService.create(enrolledSubjectsMocks.valid);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });
  });
});
