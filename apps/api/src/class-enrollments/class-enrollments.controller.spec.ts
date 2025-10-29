import { Test, TestingModule } from '@nestjs/testing';
import { ClassEnrollmentsController } from './class-enrollments.controller';
import { ClassEnrollmentsService } from './class-enrollments.service';

describe('ClassEnrollmentsController', () => {
  let controller: ClassEnrollmentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClassEnrollmentsController],
      providers: [ClassEnrollmentsService],
    }).compile();

    controller = module.get<ClassEnrollmentsController>(ClassEnrollmentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
