import { Module } from '@nestjs/common';
import { CidadeService } from './cidade.service';
import { CidadeController } from './cidade.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [CidadeController],
  providers: [CidadeService],
  imports: [ConfigModule],
})
export class CidadeModule {}
