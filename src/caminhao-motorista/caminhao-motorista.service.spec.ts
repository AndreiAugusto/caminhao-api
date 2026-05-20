import { Test, TestingModule } from '@nestjs/testing';
import { CaminhaoMotoristaService } from './caminhao-motorista.service';

describe('CaminhaoMotoristaService', () => {
  let service: CaminhaoMotoristaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CaminhaoMotoristaService],
    }).compile();

    service = module.get<CaminhaoMotoristaService>(CaminhaoMotoristaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
