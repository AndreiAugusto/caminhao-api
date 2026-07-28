import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ConfirmarUploadDto {
  @ApiProperty({ example: 'CRLV 2026' })
  titulo: string;

  @ApiPropertyOptional({ example: 'CRLV' })
  categoria?: string;

  @ApiProperty({ example: 'caminhao', enum: ['empresa', 'caminhao', 'motorista', 'fazenda'] })
  tipo: 'empresa' | 'caminhao' | 'motorista' | 'fazenda';

  @ApiPropertyOptional({ example: 1, description: 'ID do caminhão (quando tipo = caminhao)' })
  caminhaoId?: number;

  @ApiPropertyOptional({ example: 1, description: 'ID do motorista (quando tipo = motorista)' })
  motoristaId?: number;

  @ApiPropertyOptional({ example: 1, description: 'ID da fazenda (quando tipo = fazenda)' })
  fazendaId?: number;

  @ApiProperty({ description: 'URL do blob já enviado direto ao Vercel Blob' })
  url: string;

  @ApiProperty({ description: 'Nome original do arquivo' })
  nomeArquivo: string;

  @ApiProperty({ description: 'MIME type do arquivo' })
  mimeType: string;

  @ApiProperty({ description: 'Tamanho do arquivo em bytes' })
  tamanho: number;
}
