import { Module } from '@nestjs/common';
import { DocumentoService } from './documento.service';
import { ConfigModule } from '@nestjs/config';
import { DocumentoController } from './documento.controller';

@Module({
  controllers: [DocumentoController],
  providers: [DocumentoService],
  imports: [ConfigModule],
})
export class DocumentoModule {}
