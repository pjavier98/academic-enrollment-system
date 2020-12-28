import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Student } from '../students/entities/student.entity';
import { Subject } from '../subjects/entities/subject.entity';
import { Repository } from 'typeorm';
import { EnrolledSubjectsService } from './enrolled-subjects.service';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
const createMockRepository = <T = any>(): MockRepository<T> => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

const enrolledSubjectsMocks = {
  valid: require('../../test/mocks/enrolled-subjects/enrolled-subject-valid.json'),
};

const subjectsMocks = {
  valid: require('../../test/mocks/subjects/subject-valid.json'),
};

const studentMocks = {
  valid: require('../../test/mocks/students/student-valid.json'),
};

describe('EnrolledSubjectsService', () => {
  let enrolledSubjectsService: EnrolledSubjectsService;

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
      ],
    }).compile();

    enrolledSubjectsService = module.get<EnrolledSubjectsService>(
      EnrolledSubjectsService,
    );

    subjectRepository = module.get<MockRepository>(getRepositoryToken(Subject));

    studentRepository = module.get<MockRepository>(getRepositoryToken(Student));
  });

  it('should be defined', () => {
    expect(enrolledSubjectsService).toBeDefined();
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

    it('should be able to enroll a subject with a existent subject and student', async () => {
      jest
        .spyOn(subjectRepository, 'findOne')
        .mockReturnValue(subjectsMocks.valid);

      jest
        .spyOn(studentRepository, 'findOne')
        .mockReturnValue(studentMocks.valid);

      // jest.spyOn(enrolledSubjectsService, 'create').mockReturnValue({
      //   ...enrolledSubjectsMocks.valid,
      //   departament: departementsMocks.withoutSecretariatsValid.id,
      // });

      // jest.spyOn(secretariatRepository, 'save').mockReturnValue({
      //   ...secretariatsMocks.graduationValid,
      //   departament: departementsMocks.withoutSecretariatsValid.id,
      // });

      // const secretariat = await secretariatService.create(
      //   secretariatsMocks.graduationValid,
      // );

      // expect(secretariat).toEqual({
      //   ...secretariatsMocks.graduationValid,
      //   departament: departementsMocks.withoutSecretariatsValid.id,
      // });
    });
  });
});
