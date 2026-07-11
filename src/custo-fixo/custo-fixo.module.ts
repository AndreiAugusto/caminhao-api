import { Module } from '@nestjs/common';
import { CustoFixoService } from './custo-fixo.service';
import { ConfigModule } from '@nestjs/config';
import { CustoFixoController } from './custo-fixo.controller';

@Module({
  controllers: [CustoFixoController],
  providers: [CustoFixoService],
  imports: [ConfigModule],
})
export class CustoFixoModule {}
