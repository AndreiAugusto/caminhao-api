import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAbastecimentoDto {
  @ApiPropertyOptional({ example: 200.5, description: 'Litros abastecidos' })
  litros?: number;

  @ApiProperty({ example: 1200.00, description: 'Custo total do abastecimento' })
  custoTotal: number;

  @ApiProperty({ example: '2025-06-10' })
  data: Date;

  @ApiProperty({ example: 1, description: 'ID do caminhão' })
  caminhaoId: number;

  @ApiPropertyOptional({ example: 85400, description: 'Quilometragem do caminhão no momento do abastecimento' })
  quilometragem?: number;
}
