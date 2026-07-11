import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCustoFixoDto {
  @ApiProperty({ example: 'Seguro do caminhão' })
  descricao: string;

  @ApiPropertyOptional({ example: 'Seguro', description: 'Categoria do custo fixo (IPVA, Seguro, Financiamento, Outro)' })
  categoria?: string;

  @ApiProperty({ example: 850.0, description: 'Valor mensal do custo fixo' })
  valor: number;

  @ApiPropertyOptional({ example: 1, description: 'ID do caminhão (vazio = custo geral da frota)' })
  caminhaoId?: number;

  @ApiProperty({ example: 10, description: 'Dia do mês em que o custo vence (1-31)' })
  diaVencimento: number;

  @ApiProperty({ example: '2025-01-01', description: 'Data em que o custo fixo começa a valer' })
  dataInicio: Date;

  @ApiPropertyOptional({ example: '2029-01-01', description: 'Data final (vazio = recorrente indefinidamente)' })
  dataFim?: Date;

  constructor(
    descricao: string,
    valor: number,
    diaVencimento: number,
    dataInicio: Date,
    categoria?: string,
    caminhaoId?: number,
    dataFim?: Date,
  ) {
    this.descricao = descricao;
    this.valor = valor;
    this.diaVencimento = diaVencimento;
    this.dataInicio = dataInicio;
    this.categoria = categoria;
    this.caminhaoId = caminhaoId;
    this.dataFim = dataFim;
  }
}
