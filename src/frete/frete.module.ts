import { Module } from '@nestjs/common';
import { FreteService } from './frete.service';
import { FreteController } from './frete.controller';
import { ConfigModule } from '@nestjs/config';
import { NotaModule } from '../nota/nota.module';

@Module({
  imports: [ConfigModule, NotaModule],
  controllers: [FreteController],
  providers: [FreteService],
})
export class FreteModule {}
