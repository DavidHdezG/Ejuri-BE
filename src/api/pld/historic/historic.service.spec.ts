import { Test, TestingModule } from '@nestjs/testing';
import { HistoricService } from './historic.service';

describe('HistoricService', () => {
  let service: HistoricService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HistoricService],
    }).compile();

    service = module.get<HistoricService>(HistoricService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
