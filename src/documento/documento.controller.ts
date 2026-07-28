import { Controller, Get, Post, Body, Param, Delete, Query, UploadedFile, UseInterceptors, Res, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiConsumes, ApiBody } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { DocumentoService } from './documento.service';
import { CreateDocumentoDto } from './dto/create-documento.dto';
import { ConfirmarUploadDto } from './dto/confirmar-upload.dto';
import { Public } from '../auth/public.decorator';

const jwt = require('jsonwebtoken');

@ApiTags('documento')
@ApiBearerAuth()
@Controller('documento')
export class DocumentoController {
  constructor(private readonly documentoService: DocumentoService) {}

  @ApiOperation({
    summary:
      'Gera o token de upload direto pro Vercel Blob (usado para arquivos maiores que ~4MB, ' +
      'que não passam pela função serverless por causa do limite de payload da Vercel)',
  })
  @Public()
  @Post('upload-token')
  async gerarTokenUpload(@Body() body: HandleUploadBody, @Req() request: Request) {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        // Chamada feita pelo navegador do usuário — exige o mesmo Bearer token
        // usado no resto da API. (A chamada de confirmação que a Vercel faz
        // depois, em onUploadCompleted, não passa por aqui.)
        const authHeader = request.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
          throw new Error('Token não fornecido!');
        }
        try {
          jwt.verify(authHeader.split(' ')[1], process.env.TOKEN_SECRET);
        } catch {
          throw new Error('Token inválido ou expirado!');
        }

        return {
          allowedContentTypes: ['application/pdf', 'image/*'],
          addRandomSuffix: true,
          maximumSizeInBytes: 10 * 1024 * 1024,
          tokenPayload: clientPayload ?? undefined,
        };
      },
      onUploadCompleted: async () => {
        // A gravação no banco é feita explicitamente pelo front em
        // POST /documento/confirmar assim que o upload termina — não
        // dependemos deste webhook (ele não dispara em ambiente local
        // e a resposta chegaria depois do front já ter seguido em frente).
      },
    });

    return jsonResponse;
  }

  @ApiOperation({ summary: 'Confirmar documento cujo arquivo já foi enviado direto ao Vercel Blob' })
  @Post('confirmar')
  confirmarUpload(@Body() dto: ConfirmarUploadDto) {
    return this.documentoService.createFromBlob(dto);
  }

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
