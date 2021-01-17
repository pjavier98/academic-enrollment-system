import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Department } from '../departments/entities/department.entity';
import { TeachersService } from './teachers.service';
import { Teacher } from './entities/teacher.entity';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
const createMockRepository = <T = any>(): MockRepository<T> => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

const teachersMocks = {
  validTeacher: require('../../test/mocks/teachers/valid-teacher.json'),
  validDepartment: require('../../test/mocks/teachers/valid-department.json'),
};

describe('TeachersService', () => {
  let teacherService: TeachersService;

  let teacherRepository: MockRepository;
  let departmentRepository: MockRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeachersService,
        {
          provide: getRepositoryToken(Teacher),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(Department),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    teacherService = module.get<TeachersService>(TeachersService);

    teacherRepository = module.get<MockRepository>(getRepositoryToken(Teacher));
    departmentRepository = module.get<MockRepository>(
      getRepositoryToken(Department),
    );
  });

  it('should be defined', () => {
    expect(teacherService).toBeDefined();
  });

  describe('create', () => {
    it('should not be able to create a teacher in a non-existent department', async () => {
      try {
        jest.spyOn(departmentRepository, 'findOne').mockReturnValue(undefined);

        await teacherService.create(teachersMocks.validTeacher);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });

    it('should be able to create a teacher with a existent department', async () => {
      jest
        .spyOn(departmentRepository, 'findOne')
        .mockReturnValue(teachersMocks.validDepartment);
      jest.spyOn(teacherRepository, 'create').mockReturnValue({
        ...teachersMocks.validTeacher,
        department: teachersMocks.validDepartment,
      });

      jest.spyOn(teacherRepository, 'save').mockReturnValue({
        ...teachersMocks.validTeacher,
        department: teachersMocks.validDepartment,
      });

      const expectedTeacher = await teacherService.create(
        teachersMocks.validTeacher,
      );

      expect(expectedTeacher).toEqual({
        ...teachersMocks.validTeacher,
        department: teachersMocks.validDepartment,
      });
    });
  });

  describe('findOne', () => {
    it('should not be able to get a teacher with a invalid id', async () => {
      try {
        jest.spyOn(teacherRepository, 'findOne').mockReturnValue(undefined);

        await teacherService.findOne('invalid-id');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });

    it('should be able to get a teacher with a valid id', async () => {
      jest
        .spyOn(teacherRepository, 'findOne')
        .mockReturnValue(teachersMocks.validTeacher);

      const expectedTeacher = await teacherService.findOne('valid-id');

      expect(expectedTeacher).toEqual(teachersMocks.validTeacher);
    });
  });
});
