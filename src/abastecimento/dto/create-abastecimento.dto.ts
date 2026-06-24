import { ApiProperty } from '@nestjs/swagger';

export class CreateAbastecimentoDto {
  @ApiProperty({ example: 200.5, description: 'Litros abastecidos' })
  litros: number;

  @ApiProperty({ example: 1200.00, description: 'Custo total do abastecimento' })
  custoTotal: number;

  @ApiProperty({ example: '2025-06-10' })
  data: Date;

  @ApiProperty({ example: 1, description: 'ID do caminhão' })
  caminhaoId: number;
}
