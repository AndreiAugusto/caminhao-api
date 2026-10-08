import { Module } from '@nestjs/common';
import { ManutencaoService } from './manutencao.service';
import { ConfigModule } from '@nestjs/config';
import { NotaModule } from '../nota/nota.module';
import { ManutencaoController } from './manutencao.controller';

@Module({
  controllers: [ManutencaoController],
  providers: [ManutencaoService],
  imports: [ConfigModule, NotaModule],
})
export class ManutencaoModule {}
