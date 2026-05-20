import { Test, TestingModule } from '@nestjs/testing';
import { CaminhaoMotoristaController } from './caminhao-motorista.controller';
import { CaminhaoMotoristaService } from './caminhao-motorista.service';

describe('CaminhaoMotoristaController', () => {
  let controller: CaminhaoMotoristaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CaminhaoMotoristaController],
      providers: [CaminhaoMotoristaService],
    }).compile();

    controller = module.get<CaminhaoMotoristaController>(CaminhaoMotoristaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
