import { Test, TestingModule } from '@nestjs/testing';
import { ManutencaoController } from './manutencao.controller';
import { ManutencaoService } from './manutencao.service';

describe('ManutencaoController', () => {
  let controller: ManutencaoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ManutencaoController],
      providers: [ManutencaoService],
    }).compile();

    controller = module.get<ManutencaoController>(ManutencaoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
