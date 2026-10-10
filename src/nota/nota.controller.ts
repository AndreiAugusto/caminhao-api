import { Controller, Get, Post, Body, Param, Delete, Query, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { EmpresaId } from '../empresa/empresa.decorator';
import type { Response } from 'express';
import { NotaService } from './nota.service';
import { ConfirmarNotaDto } from './dto/confirmar-nota.dto';

/**
 * Notas (foto ou PDF) de fretes, manutenções e adiantamentos. O upload do arquivo usa o
 * mesmo token de POST /documento/upload-token; aqui só registramos a nota.
 */
@ApiTags('nota')
@ApiBearerAuth()
@Controller('nota')
export class NotaController {
  constructor(private readonly notaService: NotaService) {}

  @ApiOperation({ summary: 'Registrar nota cujo arquivo já foi enviado direto ao Vercel Blob' })
  @Post('confirmar')
  confirmar(@EmpresaId() empresaId: number, @Body() dto: ConfirmarNotaDto) {
    return this.notaService.confirmar(empresaId, dto);
  }

  @ApiOperation({ summary: 'Listar notas de um frete, manutenção ou adiantamento' })
  @ApiQuery({ name: 'freteId', required: false })
  @ApiQuery({ name: 'manutencaoId', required: false })
  @ApiQuery({ name: 'adiantamentoId', required: false })
  @Get()
  findAll(@EmpresaId() empresaId: number, @Query('freteId') freteId?: string, @Query('manutencaoId') manutencaoId?: string, @Query('adiantamentoId') adiantamentoId?: string) {
    return this.notaService.findAll(empresaId, {
      freteId: freteId ? +freteId : undefined,
      manutencaoId: manutencaoId ? +manutencaoId : undefined,
      adiantamentoId: adiantamentoId ? +adiantamentoId : undefined,
    });
  }

  @ApiOperation({ summary: 'Baixar/visualizar o arquivo da nota (stream autenticado, o Blob é privado)' })
  @Get(':id/arquivo')
  async getArquivo(@EmpresaId() empresaId: number, @Param('id') id: string, @Res() res: Response) {
    await this.notaService.streamArquivo(empresaId, +id, res);
  }

  @ApiOperation({ summary: 'Remover nota' })
  @Delete(':id')
  remove(@EmpresaId() empresaId: number, @Param('id') id: string) {
    return this.notaService.remove(empresaId, +id);
  }
}
