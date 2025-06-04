import { ApiProperty } from '@nestjs/swagger';

export class CreateTransactionDto {
  @ApiProperty({ example: 'prod-1' })
  productId: string;

  @ApiProperty({ example: 300000 })
  amount: number;

  @ApiProperty({ example: 10000, required: false })
  vatFee?: number;

  @ApiProperty({ example: 'COP' })
  currency: string;

  @ApiProperty({ example: 'tok_test_123' })
  paymentToken: string;

  @ApiProperty({ example: { name: 'John Doe', email: 'john@doe.com' } })
  customer: { name: string; email: string };

  @ApiProperty({ example: 'my-custom-ref-123', required: false })
  reference?: string;

  @ApiProperty({ example: 3, description: 'Cantidad de productos a comprar' })
  items: number;

  @ApiProperty({
    example: {
      country: 'Colombia',
      city: 'Bogotá',
      address: 'Calle 123 #45-67',
      zipCode: '110111',
    },
    description: 'Información de entrega',
  })
  delivery: {
    country: string;
    city: string;
    address: string;
    zipCode: string;
  };
}
