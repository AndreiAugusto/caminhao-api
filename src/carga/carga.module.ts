import { Module } from '@nestjs/common';
import { CargaService } from './carga.service';
import { CargaController } from './carga.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [CargaController],
  providers: [CargaService],
  imports: [ConfigModule],
})
export class CargaModule {}
