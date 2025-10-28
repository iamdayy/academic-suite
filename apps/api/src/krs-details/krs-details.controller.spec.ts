import { Test, TestingModule } from '@nestjs/testing';
import { KrsDetailsController } from './krs-details.controller';
import { KrsDetailsService } from './krs-details.service';

describe('KrsDetailsController', () => {
  let controller: KrsDetailsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KrsDetailsController],
      providers: [KrsDetailsService],
    }).compile();

    controller = module.get<KrsDetailsController>(KrsDetailsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
