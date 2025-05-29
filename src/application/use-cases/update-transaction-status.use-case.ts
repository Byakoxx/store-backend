import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { TransactionStatus } from 'src/domain/models/transaction-status.enum';
import { Transaction } from 'src/domain/models/transaction.entity';
import { TransactionRepository } from 'src/domain/ports-out/transaction.repository';

@Injectable()
export class UpdateTransactionStatusUseCase {
  constructor(
    @Inject('TransactionRepository')
    private readonly transactionRepository: TransactionRepository,
  ) {}

  async execute(
    id: string,
    status: TransactionStatus,
    paymentId?: string,
  ): Promise<Transaction> {
    const updated = await this.transactionRepository.updateStatus(
      id,
      status,
      paymentId,
    );
    if (!updated) {
      throw new NotFoundException('Transaction not found');
    }
    return updated;
  }
}
