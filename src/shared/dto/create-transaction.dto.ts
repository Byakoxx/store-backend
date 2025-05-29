import { ApiProperty } from '@nestjs/swagger';

export class CreateTransactionDto {
  @ApiProperty({ example: 'prod-1' })
  productId: string;

  @ApiProperty({ example: 19.99 })
  amount: number;

  @ApiProperty({ example: 'tok_test_123' })
  paymentToken: string;

  @ApiProperty({ example: { name: 'John Doe' } })
  customer: { name: string };
}
