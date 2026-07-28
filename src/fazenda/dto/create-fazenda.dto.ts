import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFazendaDto {
  @ApiProperty({ example: 'Fazenda Santa Luzia' })
  nome: string;

  @ApiPropertyOptional({ example: 1, description: 'ID da cidade onde fica a fazenda' })
  cidadeId?: number;

  constructor(nome: string, cidadeId?: number) {
    this.nome = nome;
    this.cidadeId = cidadeId;
  }
}
