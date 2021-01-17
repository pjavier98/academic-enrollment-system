import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Secretariat } from '../secretariats/entities/secretariat.entity';
import { Teacher } from '../teachers/entities/teacher.entity';
import { Repository } from 'typeorm';
import { Subject } from './entities/subject.entity';
import { SubjectsService } from './subjects.service';
import { HttpException, NotFoundException } from '@nestjs/common';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
const createMockRepository = <T = any>(): MockRepository<T> => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

const subjectsMocks = {
  valid: require('../../test/mocks/subjects/valid-subject.json'),
  toCreate: require('../../test/mocks/subjects/subject-to-create.json'),
  validTeacher: require('../../test/mocks/subjects/valid-teacher.json'),
  validGraduationSecretariat: require('../../test/mocks/subjects/valid-graduation-secretariat.json'),
  validPrerequisite: require('../../test/mocks/subjects/valid-prerequisite.json'),
  validSubjectWithSecretaryAndTeacher: require('../../test/mocks/subjects/valid-subject-with-secretary-and-teacher.json'),
  validReport: require('../../test/mocks/subjects/valid-report.json'),
  validParsedReport: require('../../test/mocks/subjects/valid-parsed-report.json'),
};

describe('SubjectsService', () => {
  let subjectService: SubjectsService;

  let subjectRepository: MockRepository;
  let secretariatRepository: MockRepository;
  let teacherRepository: MockRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubjectsService,
        {
          provide: getRepositoryToken(Subject),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(Secretariat),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(Teacher),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    subjectService = module.get<SubjectsService>(SubjectsService);

    subjectRepository = module.get<MockRepository>(getRepositoryToken(Subject));
    secretariatRepository = module.get<MockRepository>(
      getRepositoryToken(Secretariat),
    );
    teacherRepository = module.get<MockRepository>(getRepositoryToken(Teacher));
  });

  it('should be defined', () => {
    expect(subjectService).toBeDefined();
    expect(subjectRepository).toBeDefined();
    expect(secretariatRepository).toBeDefined();
    expect(teacherRepository).toBeDefined();
  });

  describe('create', () => {
    it('should not be able to create a new subject with the same code than other', async () => {
      try {
        jest
          .spyOn(subjectRepository, 'findOne')
          .mockReturnValue(subjectsMocks.valid);

        await subjectService.create(subjectsMocks.toCreate);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
      }
    });

    it('should not be able to create a new subject with a non-existent secretariat', async () => {
      try {
        jest.spyOn(subjectRepository, 'findOne').mockReturnValue(undefined);
        jest.spyOn(secretariatRepository, 'findOne').mockReturnValue(undefined);

        await subjectService.create({ ...subjectsMocks.toCreate });
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });

    it('should not be able to create a new subject with a non-existent teacher', async () => {
      try {
        jest.spyOn(subjectRepository, 'findOne').mockReturnValue(undefined);
        jest.spyOn(teacherRepository, 'findOne').mockReturnValue(undefined);

        await subjectService.create(subjectsMocks.toCreate);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });

    it('should not be able to create a new subject with a non-existent prerequisite/s', async () => {
      try {
        jest.spyOn(subjectRepository, 'findOne').mockReturnValueOnce(undefined);
        jest
          .spyOn(secretariatRepository, 'findOne')
          .mockReturnValue(subjectsMocks.validGraduationSecretariat);
        jest
          .spyOn(teacherRepository, 'findOne')
          .mockReturnValue(subjectsMocks.validTeacher);

        jest.spyOn(subjectRepository, 'findOne').mockReturnValue(undefined);

        await subjectService.create(subjectsMocks.toCreate);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });

    it('should be able to create a new subject', async () => {
      jest.spyOn(subjectRepository, 'findOne').mockReturnValueOnce(undefined);
      jest
        .spyOn(secretariatRepository, 'findOne')
        .mockReturnValue(subjectsMocks.validGraduationSecretariat);
      jest
        .spyOn(teacherRepository, 'findOne')
        .mockReturnValue(subjectsMocks.validTeacher);

      jest
        .spyOn(subjectRepository, 'findOne')
        .mockReturnValue(subjectsMocks.validPrerequisite);

      jest
        .spyOn(subjectRepository, 'create')
        .mockReturnValue(subjectsMocks.validSubjectWithSecretaryAndTeacher);

      jest
        .spyOn(subjectRepository, 'save')
        .mockReturnValue(subjectsMocks.validSubjectWithSecretaryAndTeacher);

      const expectedSubject = await subjectService.create(
        subjectsMocks.validSubjectWithSecretaryAndTeacher,
      );

      expect(expectedSubject).toEqual(
        subjectsMocks.validSubjectWithSecretaryAndTeacher,
      );
    });
  });

  describe('findOne', () => {
    it('should not be able to get a subject with a invalid id', async () => {
      try {
        jest.spyOn(subjectRepository, 'findOne').mockReturnValue(undefined);

        await subjectService.findOne('invalid-id');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });

    it('should be able to get a subject with a valid id', async () => {
      jest
        .spyOn(subjectRepository, 'findOne')
        .mockReturnValue(subjectsMocks.validReport);

      const expectedTeacher = await subjectService.findOne('valid-id');

      expect(expectedTeacher).toEqual(subjectsMocks.validParsedReport);
    });
  });
});
