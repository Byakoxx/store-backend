import { ApiProperty } from '@nestjs/swagger';

export class PaymentResponseDto {
  @ApiProperty({ example: 'PENDING', description: 'Estado de la transacción' })
  status: string;

  @ApiProperty({
    example: '0101010-0101010101-10101',
    description: 'ID of the transaction in Wompi',
  })
  wompiTransactionId: string;

  @ApiProperty({
    example: 'Insufficient funds',
    description: 'Status message or error',
  })
  statusMessage?: string;

  @ApiProperty({
    example: '51',
    description: 'Response code of the processor/card issuer',
    required: false,
  })
  processorResponseCode?: string;
}
