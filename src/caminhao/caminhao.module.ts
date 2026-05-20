import { Module } from '@nestjs/common';
import { CaminhaoService } from './caminhao.service';
import { ConfigModule } from '@nestjs/config';
import { CaminhaoController } from './caminhao.controller';

@Module({
  controllers: [CaminhaoController],
  providers: [CaminhaoService],
  imports: [ConfigModule],
})
export class CaminhaoModule {}
