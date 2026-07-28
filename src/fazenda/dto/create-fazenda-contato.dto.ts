import { ApiProperty } from '@nestjs/swagger';

export class CreateFazendaContatoDto {
  @ApiProperty({ example: 'João - (65) 99999-0000', description: 'Nome e/ou telefone do contato' })
  contato: string;
}
