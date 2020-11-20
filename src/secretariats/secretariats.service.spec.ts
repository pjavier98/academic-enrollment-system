import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Secretariat, SecretariatType } from './entities/secretariat.entity';
import { SecretariatsService } from './secretariats.service';
import { Department } from '../departments/entities/department.entity';
import { HttpException, NotFoundException } from '@nestjs/common';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
const createMockRepository = <T = any>(): MockRepository<T> => ({
  findOne: jest.fn(),
  create: jest.fn(),
});

const secretariatsMocks = {
  graduationValid: require('../../test/mocks/secretariats/graduation-valid.json'),
  posGraduationValid: require('../../test/mocks/secretariats/pos-graduation-valid.json'),
};

const departementsMocks = {
  valid: require('../../test/mocks/departments/valid.json'),
};

describe('SecretariatsService', () => {
  let secretariatService: SecretariatsService;

  let secretariatRepository: MockRepository;
  let departmentRepository: MockRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SecretariatsService,
        {
          provide: getRepositoryToken(Secretariat),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(Department),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    secretariatService = module.get<SecretariatsService>(SecretariatsService);

    secretariatRepository = module.get<MockRepository>(
      getRepositoryToken(Secretariat),
    );

    departmentRepository = module.get<MockRepository>(
      getRepositoryToken(Department),
    );
  });

  it('should be defined', () => {
    expect(secretariatService).toBeDefined();
    expect(secretariatRepository).toBeDefined();
    expect(departmentRepository).toBeDefined();
  });

  describe('create', () => {
    it('should not be able to create a secretariat in a non-existent department', async () => {
      try {
        jest
          .spyOn(departmentRepository, 'findOne')
          .mockResolvedValue(undefined);

        await secretariatService.create(secretariatsMocks.graduationValid);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });

    it('should not be able to create more than one secretariat of graduation in a department', async () => {
      try {
        jest
          .spyOn(departmentRepository, 'findOne')
          .mockResolvedValue(departementsMocks.valid);

        await secretariatService.create(secretariatsMocks.graduationValid);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
      }
    });

    it('should not be able to create more than one secretariat of pos-graduation in a department', async () => {
      try {
        jest
          .spyOn(departmentRepository, 'findOne')
          .mockResolvedValue(departementsMocks.valid);

        await secretariatService.create(secretariatsMocks.posGraduationValid);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
      }
    });
  });
});
