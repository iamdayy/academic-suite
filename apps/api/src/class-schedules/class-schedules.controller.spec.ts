import { Test, TestingModule } from '@nestjs/testing';
import { ClassSchedulesController } from './class-schedules.controller';

describe('ClassSchedulesController', () => {
  let controller: ClassSchedulesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClassSchedulesController],
    }).compile();

    controller = module.get<ClassSchedulesController>(ClassSchedulesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
