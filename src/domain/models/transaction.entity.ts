import { TransactionStatus } from './transaction-status.enum';

export class Transaction {
  constructor(
    public readonly id: string,
    public status: TransactionStatus,
    public amount: number,
    public paymentId: string | null,
    public customerId: string,
    public productId: string,
    public createdAt: Date,
    public updatedAt: Date,
  ) {}
}
