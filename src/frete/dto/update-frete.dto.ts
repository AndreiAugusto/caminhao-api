import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateFreteDto {
  @ApiPropertyOptional({ example: 'Carga de soja - SP para MG' })
  descricao?: string;

  @ApiPropertyOptional({ example: 5000.00 })
  valor?: number;

  @ApiPropertyOptional({ example: '2025-06-10' })
  data?: Date;

  @ApiPropertyOptional({ example: 1 })
  caminhaoId?: number;

  @ApiPropertyOptional({ example: 1 })
  motoristaId?: number;

  @ApiPropertyOptional({ example: 30 })
  porcentagemMotorista?: number;
}
