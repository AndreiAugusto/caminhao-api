import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAdiantamentoDto {
  @ApiProperty({ example: 1, description: 'ID do motorista' })
  motoristaId: number;

  @ApiProperty({ example: 5000.0, description: 'Valor adiantado' })
  valor: number;

  @ApiProperty({ example: '2026-09-05', description: 'Data em que o adiantamento foi feito' })
  data: string;

  @ApiPropertyOptional({ example: 2, description: 'Em quantos salários o valor será descontado (padrão: 1)' })
  numeroParcelas?: number;

  @ApiPropertyOptional({ example: 10, description: 'Mês do primeiro salário com desconto (padrão: mês da data)' })
  mesInicio?: number;

  @ApiPropertyOptional({ example: 2026, description: 'Ano do primeiro salário com desconto (padrão: ano da data)' })
  anoInicio?: number;

  @ApiPropertyOptional({ example: 'Pediu para conserto do carro' })
  observacao?: string;
}
