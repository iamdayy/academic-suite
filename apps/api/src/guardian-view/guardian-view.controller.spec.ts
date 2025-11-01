import { Test, TestingModule } from '@nestjs/testing';
import { GuardianViewController } from './guardian-view.controller';

describe('GuardianViewController', () => {
  let controller: GuardianViewController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GuardianViewController],
    }).compile();

    controller = module.get<GuardianViewController>(GuardianViewController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
