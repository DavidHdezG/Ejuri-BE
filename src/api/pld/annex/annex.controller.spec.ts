import { Test, TestingModule } from '@nestjs/testing';
import { AnnexController } from './annex.controller';
import { AnnexService } from './annex.service';

describe('AnnexController', () => {
  let controller: AnnexController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnnexController],
      providers: [AnnexService],
    }).compile();

    controller = module.get<AnnexController>(AnnexController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
