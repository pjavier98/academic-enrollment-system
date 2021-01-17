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
  newSubjectValid: require('../../test/mocks/enrolled-subjects/new-subject-valid.json'),
  subject: require('../../test/mocks/enrolled-subjects/subject.json'),
  graduationStudent: require('../../test/mocks/enrolled-subjects/graduation-student-valid.json'),
  posGraduationSubject: require('../../test/mocks/enrolled-subjects/pos-graduation-subject-valid.json'),
  posGraduationStudent: require('../../test/mocks/enrolled-subjects/pos-graduation-student.json'),
};

const subjectsMocks = {
  valid: require('../../test/mocks/subjects/valid-subject.json'),
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
  let enrolledSubjectService: EnrolledSubjectsService;

  let enrolledSubjectRepository: EnrolledSubjectRepository;
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

    enrolledSubjectService = module.get<EnrolledSubjectsService>(
      EnrolledSubjectsService,
    );

    enrolledSubjectRepository = module.get<EnrolledSubjectRepository>(
      getCustomRepositoryToken(EnrolledSubjectRepository),
    );

    subjectRepository = module.get<MockRepository>(getRepositoryToken(Subject));

    studentRepository = module.get<MockRepository>(getRepositoryToken(Student));
  });

  it('should be defined', () => {
    expect(enrolledSubjectService).toBeDefined();

    expect(enrolledSubjectRepository).toBeDefined();
    expect(subjectRepository).toBeDefined();
    expect(studentRepository).toBeDefined();
  });

  describe('create', () => {
    it('should not be able to enroll a non-existent subject', async () => {
      try {
        jest.spyOn(subjectRepository, 'findOne').mockReturnValue(undefined);
        await enrolledSubjectService.create(enrolledSubjectsMocks.valid);
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
        await enrolledSubjectService.create(enrolledSubjectsMocks.valid);
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
          .mockReturnValue(enrolledSubjectsMocks.graduationStudent);

        jest
          .spyOn(
            enrolledSubjectService,
            'enrolledStudentInASubjectWithInsufficientCredits',
          )
          .mockImplementation();

        await enrolledSubjectService.create(enrolledSubjectsMocks.valid);
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
          .mockReturnValue(enrolledSubjectsMocks.graduationStudent);

        enrolledStudentUseCases.forEach(
          (enrolledStudentUseCase: keyof EnrolledSubjectsService) => {
            if (enrolledStudentUseCase !== currentUseCase) {
              jest
                .spyOn(enrolledSubjectService, enrolledStudentUseCase)
                .mockImplementation();
            }
          },
        );

        jest
          .spyOn(enrolledSubjectRepository, 'findStudentCredits')
          .mockResolvedValue(insufficientCredits);

        await enrolledSubjectService.create(enrolledSubjectsMocks.valid);
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
          .mockReturnValue(enrolledSubjectsMocks.graduationStudent);

        enrolledStudentUseCases.forEach(
          (enrolledStudentUseCase: keyof EnrolledSubjectsService) => {
            if (enrolledStudentUseCase !== currentUseCase) {
              jest
                .spyOn(enrolledSubjectService, enrolledStudentUseCase)
                .mockImplementation();
            }
          },
        );

        jest
          .spyOn(enrolledSubjectRepository, 'findSubjectPrerequisites')
          .mockResolvedValue([]);

        await enrolledSubjectService.create(enrolledSubjectsMocks.valid);
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
          .mockReturnValue(enrolledSubjectsMocks.graduationStudent);

        enrolledStudentUseCases.forEach(
          (enrolledStudentUseCase: keyof EnrolledSubjectsService) => {
            if (enrolledStudentUseCase !== currentUseCase) {
              jest
                .spyOn(enrolledSubjectService, enrolledStudentUseCase)
                .mockImplementation();
            }
          },
        );

        jest
          .spyOn(enrolledSubjectRepository, 'findOne')
          .mockResolvedValue(enrolledSubjectsMocks.subject);

        await enrolledSubjectService.create(enrolledSubjectsMocks.valid);
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
          .mockReturnValue(enrolledSubjectsMocks.posGraduationSubject);

        jest
          .spyOn(studentRepository, 'findOne')
          .mockReturnValue(enrolledSubjectsMocks.graduationStudent);

        enrolledStudentUseCases.forEach(
          (enrolledStudentUseCase: keyof EnrolledSubjectsService) => {
            if (enrolledStudentUseCase !== currentUseCase) {
              jest
                .spyOn(enrolledSubjectService, enrolledStudentUseCase)
                .mockImplementation();
            }
          },
        );

        jest
          .spyOn(enrolledSubjectRepository, 'findStudentCredits')
          .mockResolvedValue(insufficientCreditsForPosGraduationSubject);

        await enrolledSubjectService.create(enrolledSubjectsMocks.valid);
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
                .spyOn(enrolledSubjectService, enrolledStudentUseCase)
                .mockImplementation();
            }
          },
        );

        await enrolledSubjectService.create(enrolledSubjectsMocks.valid);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('should be able to enrolled in a subject', async () => {
      jest
        .spyOn(subjectRepository, 'findOne')
        .mockReturnValue(enrolledSubjectsMocks.subject);

      jest
        .spyOn(studentRepository, 'findOne')
        .mockReturnValue(enrolledSubjectsMocks.posGraduationStudent);

      enrolledStudentUseCases.forEach(
        (enrolledStudentUseCase: keyof EnrolledSubjectsService) => {
          jest
            .spyOn(enrolledSubjectService, enrolledStudentUseCase)
            .mockImplementation();
        },
      );

      jest
        .spyOn(enrolledSubjectRepository, 'create')
        .mockReturnValue(enrolledSubjectsMocks.newSubjectValid);

      jest
        .spyOn(enrolledSubjectRepository, 'save')
        .mockReturnValue(enrolledSubjectsMocks.newSubjectValid);

      const newEnrolledSubject = await enrolledSubjectService.create(
        enrolledSubjectsMocks.valid,
      );

      expect(newEnrolledSubject).toEqual(enrolledSubjectsMocks.newSubjectValid);
    });
  });
});
