import { Test, TestingModule } from '@nestjs/testing';
import { HistoricController } from './historic.controller';
import { HistoricService } from './historic.service';

describe('HistoricController', () => {
  let controller: HistoricController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HistoricController],
      providers: [HistoricService],
    }).compile();

    controller = module.get<HistoricController>(HistoricController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
