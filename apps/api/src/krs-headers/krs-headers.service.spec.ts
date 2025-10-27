import { Test, TestingModule } from '@nestjs/testing';
import { KrsHeadersService } from './krs-headers.service';

describe('KrsHeadersService', () => {
  let service: KrsHeadersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KrsHeadersService],
    }).compile();

    service = module.get<KrsHeadersService>(KrsHeadersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
