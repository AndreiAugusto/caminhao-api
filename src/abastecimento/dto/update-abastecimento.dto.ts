import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAbastecimentoDto {
  @ApiPropertyOptional({ example: 200.5 })
  litros?: number;

  @ApiPropertyOptional({ example: 1200.00 })
  custoTotal?: number;

  @ApiPropertyOptional({ example: '2025-06-10' })
  data?: Date;

  @ApiPropertyOptional({ example: 1 })
  caminhaoId?: number;

  @ApiPropertyOptional({ example: 85400 })
  quilometragem?: number;
}
