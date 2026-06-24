import { Module } from '@nestjs/common';
import { AbastecimentoService } from './abastecimento.service';
import { AbastecimentoController } from './abastecimento.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [AbastecimentoController],
  providers: [AbastecimentoService],
})
export class AbastecimentoModule {}
