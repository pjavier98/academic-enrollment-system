import { HttpException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DepartmentsService } from './departments.service';
import { Department } from './entities/department.entity';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
const createMockRepository = <T = any>(): MockRepository<T> => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

const departmentMocks = {
  valid: require('../../test/mocks/departments/valid-department.json'),
  validDepartmentToList: require('../../test/mocks/departments/valid-department-to-list.json'),
};

describe('DepartmentsService', () => {
  let departmentService: DepartmentsService;

  let departmentRepository: MockRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DepartmentsService,
        {
          provide: getRepositoryToken(Department),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    departmentService = module.get<DepartmentsService>(DepartmentsService);

    departmentRepository = module.get<MockRepository>(
      getRepositoryToken(Department),
    );
  });

  it('should be defined', () => {
    expect(departmentService).toBeDefined();
  });

  describe('create', () => {
    it('should not be able to create a new department with the same name than other', async () => {
      try {
        jest
          .spyOn(departmentRepository, 'findOne')
          .mockReturnValue(departmentMocks.valid);

        await departmentService.create(departmentMocks.valid);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
      }
    });

    it('should be able to create a new department with different name', async () => {
      try {
        jest.spyOn(departmentRepository, 'findOne').mockReturnValue(undefined);

        await departmentService.create(departmentMocks.valid);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
      }
    });
  });

  describe('findOne', () => {
    it('should not be able to get a department with a invalid id', async () => {
      try {
        jest.spyOn(departmentRepository, 'findOne').mockReturnValue(undefined);

        await departmentService.findOne('invalid-id');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });

    it('should be able to get a department with a valid id', async () => {
      jest
        .spyOn(departmentRepository, 'findOne')
        .mockReturnValue(departmentMocks.validDepartmentToList);

      const expectedDepartment = await departmentService.findOne('valid-id');
      expect(expectedDepartment).toEqual(departmentMocks.validDepartmentToList);
    });
  });
});
