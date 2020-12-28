import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Secretariat } from './entities/secretariat.entity';
import { SecretariatsService } from './secretariats.service';
import { Department } from '../departments/entities/department.entity';
import { HttpException, NotFoundException } from '@nestjs/common';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
const createMockRepository = <T = any>(): MockRepository<T> => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

const secretariatsMocks = {
  graduationValid: require('../../test/mocks/secretariats/graduation-valid.json'),
  posGraduationValid: require('../../test/mocks/secretariats/pos-graduation-valid.json'),
};

const departementsMocks = {
  withBothSecretariatsValid: require('../../test/mocks/departments/with-both-secretariats-valid.json'),
  withoutSecretariatsValid: require('../../test/mocks/departments/without-secretariats-valid.json'),
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
        jest.spyOn(departmentRepository, 'findOne').mockReturnValue(undefined);

        await secretariatService.create(secretariatsMocks.graduationValid);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });

    it('should be able to create just one secretariat of graduation in a department', async () => {
      jest
        .spyOn(departmentRepository, 'findOne')
        .mockReturnValue(departementsMocks.withoutSecretariatsValid);

      jest.spyOn(secretariatRepository, 'create').mockReturnValue({
        ...secretariatsMocks.graduationValid,
        departament: departementsMocks.withoutSecretariatsValid.id,
      });

      jest.spyOn(secretariatRepository, 'save').mockReturnValue({
        ...secretariatsMocks.graduationValid,
        departament: departementsMocks.withoutSecretariatsValid.id,
      });

      const secretariat = await secretariatService.create(
        secretariatsMocks.graduationValid,
      );

      expect(secretariat).toEqual({
        ...secretariatsMocks.graduationValid,
        departament: departementsMocks.withoutSecretariatsValid.id,
      });
    });

    it('should not be able to create more than one secretariat of graduation in a department', async () => {
      try {
        jest
          .spyOn(departmentRepository, 'findOne')
          .mockReturnValue(departementsMocks.withBothSecretariatsValid);

        await secretariatService.create(secretariatsMocks.graduationValid);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
      }
    });

    it('should not be able to create more than one secretariat of pos-graduation in a department', async () => {
      try {
        jest
          .spyOn(departmentRepository, 'findOne')
          .mockReturnValue(departementsMocks.withBothSecretariatsValid);

        await secretariatService.create(secretariatsMocks.posGraduationValid);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
      }
    });
  });
});
