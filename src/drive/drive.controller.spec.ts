import { Test, TestingModule } from '@nestjs/testing';
import { DriveController } from './drive.controller';

describe('DriveController', () => {
  let controller: DriveController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DriveController],
    }).compile();

    controller = module.get<DriveController>(DriveController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
