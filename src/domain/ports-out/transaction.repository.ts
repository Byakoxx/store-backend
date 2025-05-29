import { Transaction } from '../models/transaction.entity';

export interface TransactionRepository {
  create(transaction: Transaction): Promise<Transaction>;
  findById(id: string): Promise<Transaction | null>;
  updateStatus(
    id: string,
    status: string,
    paymentId?: string,
  ): Promise<Transaction | null>;
  findAll(): Promise<Transaction[]>;
}
