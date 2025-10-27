import { Test, TestingModule } from '@nestjs/testing';
import { KrsHeadersController } from './krs-headers.controller';
import { KrsHeadersService } from './krs-headers.service';

describe('KrsHeadersController', () => {
  let controller: KrsHeadersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KrsHeadersController],
      providers: [KrsHeadersService],
    }).compile();

    controller = module.get<KrsHeadersController>(KrsHeadersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
