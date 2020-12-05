import { Test, TestingModule } from '@nestjs/testing';
import { EnrolledSubjectsService } from './enrolled-subjects.service';

describe('EnrolledSubjectsService', () => {
  let service: EnrolledSubjectsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EnrolledSubjectsService],
    }).compile();

    service = module.get<EnrolledSubjectsService>(EnrolledSubjectsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
