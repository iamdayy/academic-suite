import { Test, TestingModule } from '@nestjs/testing';
import { GuardianViewService } from './guardian-view.service';

describe('GuardianViewService', () => {
  let service: GuardianViewService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GuardianViewService],
    }).compile();

    service = module.get<GuardianViewService>(GuardianViewService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
