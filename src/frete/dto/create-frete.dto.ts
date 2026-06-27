import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFreteDto {
  @ApiPropertyOptional({ example: 'Carga de soja - SP para MG' })
  descricao?: string;

  @ApiProperty({ example: 5000.00, description: 'Valor total do frete' })
  valor: number;

  @ApiProperty({ example: '2025-06-10' })
  data: Date;

  @ApiProperty({ example: 1, description: 'ID do caminhão' })
  caminhaoId: number;

  @ApiProperty({ example: 1, description: 'ID do motorista' })
  motoristaId: number;

  @ApiProperty({ example: 30, description: 'Porcentagem do valor que o motorista recebe (0-100)' })
  porcentagemMotorista: number;

  @ApiPropertyOptional({ example: 1, description: 'ID da cidade de origem' })
  origemId?: number;

  @ApiPropertyOptional({ example: 2, description: 'ID da cidade de destino' })
  destinoId?: number;

  @ApiPropertyOptional({ example: 1, description: 'ID do tipo de carga' })
  cargaId?: number;
}
