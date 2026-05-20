import { Module } from '@nestjs/common';
import { OficinaService } from './oficina.service';
import { OficinaController } from './oficina.controller';

@Module({
  controllers: [OficinaController],
  providers: [OficinaService],
})
export class OficinaModule {}
