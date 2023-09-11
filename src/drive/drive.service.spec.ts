import { Test, TestingModule } from '@nestjs/testing';
import { DriveService } from './drive.service';

describe('DriveService', () => {
  let service: DriveService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DriveService],
    }).compile();

    service = module.get<DriveService>(DriveService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
