import { Module } from '@nestjs/common';
import { CaminhaoMotoristaService } from './caminhao-motorista.service';
import { CaminhaoMotoristaController } from './caminhao-motorista.controller';

@Module({
  controllers: [CaminhaoMotoristaController],
  providers: [CaminhaoMotoristaService],
})
export class CaminhaoMotoristaModule {}
