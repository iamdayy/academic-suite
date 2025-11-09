import { Test, TestingModule } from '@nestjs/testing';
import { ClassSchedulesService } from './class-schedules.service';

describe('ClassSchedulesService', () => {
  let service: ClassSchedulesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClassSchedulesService],
    }).compile();

    service = module.get<ClassSchedulesService>(ClassSchedulesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
