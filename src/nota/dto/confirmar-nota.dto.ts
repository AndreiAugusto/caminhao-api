import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ConfirmarNotaDto {
  @ApiPropertyOptional({ example: 1, description: 'ID do frete (informe só um dos vínculos)' })
  freteId?: number;

  @ApiPropertyOptional({ example: 1, description: 'ID da manutenção (informe só um dos vínculos)' })
  manutencaoId?: number;

  @ApiPropertyOptional({ example: 1, description: 'ID do adiantamento (informe só um dos vínculos)' })
  adiantamentoId?: number;

  @ApiProperty({ description: 'URL do blob já enviado direto ao Vercel Blob' })
  url: string;

  @ApiProperty({ description: 'Nome original do arquivo' })
  nomeArquivo: string;

  @ApiProperty({ description: 'MIME type do arquivo' })
  mimeType: string;

  @ApiProperty({ description: 'Tamanho do arquivo em bytes' })
  tamanho: number;
}
