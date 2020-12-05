import { Test, TestingModule } from '@nestjs/testing';
import { EnrolledSubjectsController } from './enrolled-subjects.controller';
import { EnrolledSubjectsService } from './enrolled-subjects.service';

describe('EnrolledSubjectsController', () => {
  let controller: EnrolledSubjectsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EnrolledSubjectsController],
      providers: [EnrolledSubjectsService],
    }).compile();

    controller = module.get<EnrolledSubjectsController>(EnrolledSubjectsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
