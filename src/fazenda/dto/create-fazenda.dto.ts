import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFazendaDto {
  @ApiProperty({ example: 'Fazenda Santa Luzia' })
  nome: string;

  @ApiPropertyOptional({ example: 1, description: 'ID da cidade onde fica a fazenda' })
  cidadeId?: number;

  @ApiPropertyOptional({ example: 'João - (65) 99999-0000', description: 'Contato (nome/telefone)' })
  contato?: string;

  constructor(nome: string, cidadeId?: number, contato?: string) {
    this.nome = nome;
    this.cidadeId = cidadeId;
    this.contato = contato;
  }
}
