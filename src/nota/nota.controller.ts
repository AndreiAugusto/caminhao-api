import { Controller, Get, Post, Body, Param, Delete, Query, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import type { Response } from 'express';
import { NotaService } from './nota.service';
import { ConfirmarNotaDto } from './dto/confirmar-nota.dto';

/**
 * Notas (foto ou PDF) de fretes e manutenções. O upload do arquivo usa o
 * mesmo token de POST /documento/upload-token; aqui só registramos a nota.
 */
@ApiTags('nota')
@ApiBearerAuth()
@Controller('nota')
export class NotaController {
  constructor(private readonly notaService: NotaService) {}

  @ApiOperation({ summary: 'Registrar nota cujo arquivo já foi enviado direto ao Vercel Blob' })
  @Post('confirmar')
  confirmar(@Body() dto: ConfirmarNotaDto) {
    return this.notaService.confirmar(dto);
  }

  @ApiOperation({ summary: 'Listar notas de um frete ou de uma manutenção' })
  @ApiQuery({ name: 'freteId', required: false })
  @ApiQuery({ name: 'manutencaoId', required: false })
  @Get()
  findAll(@Query('freteId') freteId?: string, @Query('manutencaoId') manutencaoId?: string) {
    return this.notaService.findAll({
      freteId: freteId ? +freteId : undefined,
      manutencaoId: manutencaoId ? +manutencaoId : undefined,
    });
  }

  @ApiOperation({ summary: 'Baixar/visualizar o arquivo da nota (stream autenticado, o Blob é privado)' })
  @Get(':id/arquivo')
  async getArquivo(@Param('id') id: string, @Res() res: Response) {
    await this.notaService.streamArquivo(+id, res);
  }

  @ApiOperation({ summary: 'Remover nota' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notaService.remove(+id);
  }
}
