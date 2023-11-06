import { Test, TestingModule } from '@nestjs/testing';
import { AnnexGenerationController } from './annex-generation.controller';

describe('AnnexGenerationController', () => {
  let controller: AnnexGenerationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnnexGenerationController],
    }).compile();

    controller = module.get<AnnexGenerationController>(AnnexGenerationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
