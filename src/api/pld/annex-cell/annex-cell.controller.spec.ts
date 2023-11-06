import { Test, TestingModule } from '@nestjs/testing';
import { AnnexCellController } from './annex-cell.controller';
import { AnnexCellService } from './annex-cell.service';

describe('AnnexCellController', () => {
  let controller: AnnexCellController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnnexCellController],
      providers: [AnnexCellService],
    }).compile();

    controller = module.get<AnnexCellController>(AnnexCellController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
