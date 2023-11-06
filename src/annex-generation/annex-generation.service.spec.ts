import { Test, TestingModule } from '@nestjs/testing';
import { AnnexGenerationService } from './annex-generation.service';

describe('AnnexGenerationService', () => {
  let service: AnnexGenerationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AnnexGenerationService],
    }).compile();

    service = module.get<AnnexGenerationService>(AnnexGenerationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
