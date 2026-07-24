import { Module } from '@nestjs/common';
import { FazendaService } from './fazenda.service';
import { ConfigModule } from '@nestjs/config';
import { FazendaController } from './fazenda.controller';

@Module({
  controllers: [FazendaController],
  providers: [FazendaService],
  imports: [ConfigModule],
})
export class FazendaModule {}
