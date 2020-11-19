import { Test, TestingModule } from '@nestjs/testing';
import { SecretariatsController } from './secretariats.controller';
import { SecretariatsService } from './secretariats.service';

describe('SecretariatsController', () => {
  let controller: SecretariatsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SecretariatsController],
      providers: [SecretariatsService],
    }).compile();

    controller = module.get<SecretariatsController>(SecretariatsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
