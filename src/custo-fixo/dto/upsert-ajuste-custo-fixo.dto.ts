import { ApiProperty } from '@nestjs/swagger';

export class UpsertAjusteCustoFixoDto {
  @ApiProperty({ example: 2026, description: 'Ano do ajuste' })
  ano: number;

  @ApiProperty({ example: 7, description: 'Mês do ajuste (1-12)' })
  mes: number;

  @ApiProperty({ example: 5230.5, description: 'Valor que substitui o valor padrão do custo fixo nesse mês' })
  valor: number;
}
