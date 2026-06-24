import { ApiProperty } from '@nestjs/swagger';

export class CreateCaminhaoMotoristaDto {
  @ApiProperty({ example: '2025-01-15', description: 'Data da associação' })
  data: Date;

  @ApiProperty({ example: 1, description: 'ID do motorista' })
  motoristaId: number;

  @ApiProperty({ example: 1, description: 'ID do caminhão' })
  caminhaoId: number;

  constructor(data: Date, motoristaId: number, caminhaoId: number) {
    this.data = data;
    this.motoristaId = motoristaId;
    this.caminhaoId = caminhaoId;
  }
}
