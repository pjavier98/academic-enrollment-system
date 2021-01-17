import { Repository } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Department } from '../departments/entities/department.entity';
import { Student } from './entities/student.entity';
import { StudentsService } from './students.service';
import { NotFoundException } from '@nestjs/common';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
const createMockRepository = <T = any>(): MockRepository<T> => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

const studentsMocks = {
  validStudent: require('../../test/mocks/students/valid-student.json'),
  validDepartment: require('../../test/mocks/students/valid-department.json'),
  validReport: require('../../test/mocks/students/valid-report.json'),
  validParsedReport: require('../../test/mocks/students/valid-parsed-report.json'),
};

describe('StudentsService', () => {
  let studentService: StudentsService;

  let studentRepository: MockRepository;
  let departmentRepository: MockRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentsService,
        {
          provide: getRepositoryToken(Student),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(Department),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    studentService = module.get<StudentsService>(StudentsService);

    studentRepository = module.get<MockRepository>(getRepositoryToken(Student));
    departmentRepository = module.get<MockRepository>(
      getRepositoryToken(Department),
    );
  });

  it('should be defined', () => {
    expect(studentService).toBeDefined();
  });

  describe('create', () => {
    it('should not be able to create a student in a non-existent department', async () => {
      try {
        jest.spyOn(departmentRepository, 'findOne').mockReturnValue(undefined);

        await studentService.create(studentsMocks.validStudent);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });

    it('should be able to create a student with a existent department', async () => {
      jest
        .spyOn(departmentRepository, 'findOne')
        .mockReturnValue(studentsMocks.validDepartment);
      jest.spyOn(studentRepository, 'create').mockReturnValue({
        ...studentsMocks.validStudent,
        department: studentsMocks.validDepartment,
      });

      jest.spyOn(studentRepository, 'save').mockReturnValue({
        ...studentsMocks.validStudent,
        department: studentsMocks.validDepartment,
      });

      const expectedStudent = await studentService.create(
        studentsMocks.validStudent,
      );

      expect(expectedStudent).toEqual({
        ...studentsMocks.validStudent,
        department: studentsMocks.validDepartment,
      });
    });
  });

  describe('findOne', () => {
    it('should not be able to get a teacher with a invalid id', async () => {
      try {
        jest.spyOn(studentRepository, 'findOne').mockReturnValue(undefined);

        await studentService.findOne('invalid-id');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });

    it('should be able to get a teacher with a valid id', async () => {
      jest
        .spyOn(studentRepository, 'findOne')
        .mockReturnValue(studentsMocks.validReport);

      const expectedStudent = await studentService.findOne('valid-id');

      expect(expectedStudent).toEqual(studentsMocks.validParsedReport);
    });
  });
});
