import { Test, TestingModule } from '@nestjs/testing';
import { DriveDirectoryController } from './drive-directory.controller';
import { DriveDirectoryService } from './drive-directory.service';

describe('DriveDirectoryController', () => {
  let controller: DriveDirectoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DriveDirectoryController],
      providers: [DriveDirectoryService],
    }).compile();

    controller = module.get<DriveDirectoryController>(DriveDirectoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
