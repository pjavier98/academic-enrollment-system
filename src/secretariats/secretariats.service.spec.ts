import { Test, TestingModule } from '@nestjs/testing';
import { SecretariatsService } from './secretariats.service';

describe('SecretariatsService', () => {
  let service: SecretariatsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SecretariatsService],
    }).compile();

    service = module.get<SecretariatsService>(SecretariatsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should not be able to create more than one secretariat of graduation in a department', () => {
      // const secretariatSpy = jest.spyOn(service, 'create').mockResolvedValue({
      //   id: '1',
      // });
      // const secretariat = service.create;
    });
  });
});
