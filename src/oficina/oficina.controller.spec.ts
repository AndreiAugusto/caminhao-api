import { Test, TestingModule } from '@nestjs/testing';
import { OficinaController } from './oficina.controller';
import { OficinaService } from './oficina.service';

describe('OficinaController', () => {
  let controller: OficinaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OficinaController],
      providers: [OficinaService],
    }).compile();

    controller = module.get<OficinaController>(OficinaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
