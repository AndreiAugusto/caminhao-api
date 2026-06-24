import { ApiProperty } from '@nestjs/swagger';

export class CreateOficinaDto {
  @ApiProperty({ example: 'Oficina do Zé' })
  nomeOficina: string;

  constructor(nomeOficina: string) {
    this.nomeOficina = nomeOficina;
  }
}
