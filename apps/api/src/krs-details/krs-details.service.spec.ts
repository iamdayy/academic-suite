import { Test, TestingModule } from '@nestjs/testing';
import { KrsDetailsService } from './krs-details.service';

describe('KrsDetailsService', () => {
  let service: KrsDetailsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KrsDetailsService],
    }).compile();

    service = module.get<KrsDetailsService>(KrsDetailsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
