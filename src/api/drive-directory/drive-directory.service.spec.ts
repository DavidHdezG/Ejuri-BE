import { Test, TestingModule } from '@nestjs/testing';
import { DriveDirectoryService } from './drive-directory.service';

describe('DriveDirectoryService', () => {
  let service: DriveDirectoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DriveDirectoryService],
    }).compile();

    service = module.get<DriveDirectoryService>(DriveDirectoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
