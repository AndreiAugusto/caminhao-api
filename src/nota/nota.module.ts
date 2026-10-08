import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NotaService } from './nota.service';
import { NotaController } from './nota.controller';

@Module({
  controllers: [NotaController],
  providers: [NotaService],
  imports: [ConfigModule],
  exports: [NotaService],
})
export class NotaModule {}
