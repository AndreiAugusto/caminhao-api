import { Module } from '@nestjs/common';
import { MotoristaService } from './motorista.service';
import { ConfigModule } from '@nestjs/config';
import { MotoristaController } from './motorista.controller';

@Module({
  controllers: [MotoristaController],
  providers: [MotoristaService],
    imports: [ConfigModule],
})
export class MotoristaModule {}
