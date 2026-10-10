import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAdiantamentoDto {
  @ApiPropertyOptional({ example: 1 })
  motoristaId?: number;

  @ApiPropertyOptional({ example: 5000.0 })
  valor?: number;

  @ApiPropertyOptional({ example: '2026-09-05' })
  data?: string;

  @ApiPropertyOptional({ example: 2, description: 'Alterar valor, parcelas ou início refaz as parcelas' })
  numeroParcelas?: number;

  @ApiPropertyOptional({ example: 10 })
  mesInicio?: number;

  @ApiPropertyOptional({ example: 2026 })
  anoInicio?: number;

  @ApiPropertyOptional({ example: 'Pediu para conserto do carro' })
  observacao?: string | null;
}
