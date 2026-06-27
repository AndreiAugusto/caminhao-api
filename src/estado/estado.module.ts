import { Module } from '@nestjs/common';
import { EstadoService } from './estado.service';
import { EstadoController } from './estado.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [EstadoController],
  providers: [EstadoService],
  imports: [ConfigModule],
})
export class EstadoModule {}
