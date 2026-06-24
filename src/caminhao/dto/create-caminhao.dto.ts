import { ApiProperty } from '@nestjs/swagger';

export class CreateCaminhaoDto {
  @ApiProperty({ example: 'Volvo FH' })
  modelo: string;

  @ApiProperty({ example: '2022-01-01', description: 'Ano de fabricação' })
  ano: Date;

  @ApiProperty({ example: 'ABC-1234' })
  placa: string;

  constructor(modelo: string, ano: Date, placa: string) {
    this.modelo = modelo;
    this.ano = ano;
    this.placa = placa;
  }
}
