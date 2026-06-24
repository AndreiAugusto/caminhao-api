import { ApiProperty } from '@nestjs/swagger';

export class CreateUsuarioDto {
  @ApiProperty({ example: 'João Silva' })
  nome: string;

  @ApiProperty({ example: 'joao@email.com' })
  email: string;

  @ApiProperty({ example: 'senha123' })
  senha: string;

  constructor(nome: string, email: string, senha: string) {
    this.nome = nome;
    this.email = email;
    this.senha = senha;
  }
}
