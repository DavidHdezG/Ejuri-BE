import { Test, TestingModule } from '@nestjs/testing';
import { AnnexCellService } from './annex-cell.service';

describe('AnnexCellService', () => {
  let service: AnnexCellService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AnnexCellService],
    }).compile();

    service = module.get<AnnexCellService>(AnnexCellService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
