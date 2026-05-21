import { Module } from '@nestjs/common';
import { CaminhaoMotoristaService } from './caminhao-motorista.service';
import { ConfigModule } from '@nestjs/config';
import { CaminhaoMotoristaController } from './caminhao-motorista.controller';

@Module({
  controllers: [CaminhaoMotoristaController],
  providers: [CaminhaoMotoristaService],
      imports: [ConfigModule],
})
export class CaminhaoMotoristaModule {}
