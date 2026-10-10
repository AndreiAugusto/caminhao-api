import { Module } from '@nestjs/common';
import { AdiantamentoService } from './adiantamento.service';
import { AdiantamentoController } from './adiantamento.controller';
import { ConfigModule } from '@nestjs/config';
import { NotaModule } from '../nota/nota.module';

@Module({
  imports: [ConfigModule, NotaModule],
  controllers: [AdiantamentoController],
  providers: [AdiantamentoService],
})
export class AdiantamentoModule {}
