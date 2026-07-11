import { ApiProperty } from '@nestjs/swagger';

export class UpdateParcelaDto {
  @ApiProperty({ example: true, description: 'Status de pagamento da parcela' })
  pago: boolean;

  constructor(pago: boolean) {
    this.pago = pago;
  }
}
