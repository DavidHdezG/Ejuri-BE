import { Test, TestingModule } from '@nestjs/testing';
import { AnnexService } from './annex.service';

describe('AnnexService', () => {
  let service: AnnexService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AnnexService],
    }).compile();

    service = module.get<AnnexService>(AnnexService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
