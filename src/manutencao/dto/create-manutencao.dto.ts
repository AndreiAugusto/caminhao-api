import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateManutencaoDto {
  @ApiPropertyOptional({ example: 'Troca de óleo e filtros' })
  descricao: string;

  @ApiPropertyOptional({ example: 350.00, description: 'Custo total da manutenção' })
  custo: number;

  @ApiProperty({ example: '2025-06-01' })
  data: Date;

  @ApiProperty({ example: 1, description: 'ID do caminhão' })
  caminhaoId: number;

  @ApiProperty({ example: 1, description: 'ID da oficina' })
  oficinaId: number;

  @ApiPropertyOptional({ example: 3, description: 'Número de parcelas (default 1 = à vista)' })
  numeroParcelas?: number;

  constructor(descricao: string, custo: number, data: Date, caminhaoId: number, oficinaId: number, numeroParcelas?: number) {
    this.descricao = descricao;
    this.custo = custo;
    this.data = data;
    this.caminhaoId = caminhaoId;
    this.oficinaId = oficinaId;
    this.numeroParcelas = numeroParcelas;
  }
}
