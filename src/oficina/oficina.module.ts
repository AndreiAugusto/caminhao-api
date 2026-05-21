import { Module } from '@nestjs/common';
import { OficinaService } from './oficina.service';
import { ConfigModule } from '@nestjs/config';
import { OficinaController } from './oficina.controller';

@Module({
  controllers: [OficinaController],
  providers: [OficinaService],
    imports: [ConfigModule],
})
export class OficinaModule {}
