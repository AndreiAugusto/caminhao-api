import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePerfilDto {
  @ApiPropertyOptional({ example: 'João Silva' })
  nome?: string;

  @ApiPropertyOptional({ example: 'joao@email.com' })
  email?: string;

  @ApiPropertyOptional({ example: 'novaSenha123' })
  novaSenha?: string;

  @ApiProperty({ example: 'senhaAtual123' })
  senhaAtual: string;
}
