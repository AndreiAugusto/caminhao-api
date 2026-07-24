import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDocumentoDto {
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
}
