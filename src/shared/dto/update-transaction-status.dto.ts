import { ApiProperty } from '@nestjs/swagger';
import { TransactionStatus } from 'src/domain/models/transaction-status.enum';

export class UpdateTransactionStatusDto {
  @ApiProperty({
    enum: TransactionStatus,
    example: TransactionStatus.APPROVED,
  })
  status: TransactionStatus;

  @ApiProperty({ example: 'payment_123', required: false })
  paymentId?: string;
}
