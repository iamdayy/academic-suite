import { Test, TestingModule } from '@nestjs/testing';
import { ClassEnrollmentsService } from './class-enrollments.service';

describe('ClassEnrollmentsService', () => {
  let service: ClassEnrollmentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClassEnrollmentsService],
    }).compile();

    service = module.get<ClassEnrollmentsService>(ClassEnrollmentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
