import { ApiProperty } from '@nestjs/swagger';

export class PaymentRequestDto {
  @ApiProperty({ example: 1000000, description: 'Amount in cents' })
  amountInCents: number;

  @ApiProperty({ example: 'COP', description: 'Currency' })
  currency: string;

  @ApiProperty({
    example: 'cliente@correo.com',
    description: 'Email of the customer',
    required: false,
  })
  customerEmail?: string;

  @ApiProperty({
    example: 'referencia_unica',
    description: 'Unique reference of the transaction',
  })
  reference: string;

  @ApiProperty({ example: 2, description: 'Number of installments' })
  installments: number;

  @ApiProperty({
    example: 'tok_prod_1_BBb749EAB32e97a2D058Dd538a608301',
    description: 'Token of the card',
  })
  token: string;
}
