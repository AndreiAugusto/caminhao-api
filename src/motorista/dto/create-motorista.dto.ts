import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMotoristaDto {
  @ApiProperty({ example: 'Carlos Souza' })
  nomeMotorista: string;

  @ApiProperty({ example: '1985-04-15', description: 'Data de nascimento' })
  nascimento: Date;

  @ApiPropertyOptional({ example: '12345678901', description: 'Número da carteira de habilitação' })
  nCarteira: string;

  constructor(nomeMotorista: string, nascimento: Date, nCarteira: string) {
    this.nomeMotorista = nomeMotorista;
    this.nascimento = nascimento;
    this.nCarteira = nCarteira;
  }
}
