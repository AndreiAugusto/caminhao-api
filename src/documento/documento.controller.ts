import { Controller, Get, Post, Body, Param, Delete, Query, UploadedFile, UseInterceptors, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiConsumes, ApiBody } from '@nestjs/swagger';
import type { Response } from 'express';
import { DocumentoService } from './documento.service';
import { CreateDocumentoDto } from './dto/create-documento.dto';

@ApiTags('documento')
@ApiBearerAuth()
@Controller('documento')
export class DocumentoController {
  constructor(private readonly documentoService: DocumentoService) {}

  @ApiOperation({ summary: 'Enviar documento (upload)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        arquivo: { type: 'string', format: 'binary' },
        titulo: { type: 'string' },
        categoria: { type: 'string' },
        tipo: { type: 'string', enum: ['empresa', 'caminhao', 'motorista', 'fazenda'] },
        caminhaoId: { type: 'number' },
        motoristaId: { type: 'number' },
        fazendaId: { type: 'number' },
      },
    },
  })
  @Post()
  @UseInterceptors(FileInterceptor('arquivo', { limits: { fileSize: 4 * 1024 * 1024 } }))
  create(@Body() createDocumentoDto: CreateDocumentoDto, @UploadedFile() arquivo?: Express.Multer.File) {
    return this.documentoService.create(createDocumentoDto, arquivo);
  }

  @ApiOperation({ summary: 'Listar documentos (filtrar por tipo e/ou entidade vinculada)' })
  @ApiQuery({ name: 'tipo', required: false, enum: ['empresa', 'caminhao', 'motorista', 'fazenda'] })
  @ApiQuery({ name: 'entidadeId', required: false, description: 'ID do caminhão/motorista/fazenda vinculado' })
  @Get()
  findAll(@Query('tipo') tipo?: string, @Query('entidadeId') entidadeId?: string) {
    return this.documentoService.findAll({
      tipo,
      entidadeId: entidadeId ? +entidadeId : undefined,
    });
  }

  @ApiOperation({ summary: 'Baixar/visualizar o arquivo de um documento (stream autenticado, o Blob é privado)' })
  @Get(':id/arquivo')
  async getArquivo(@Param('id') id: string, @Res() res: Response) {
    await this.documentoService.streamArquivo(+id, res);
  }

  @ApiOperation({ summary: 'Remover documento' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.documentoService.remove(+id);
  }
}
