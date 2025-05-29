import { Inject, Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { TransactionRepository } from '../../domain/ports-out/transaction.repository';
import { GetTransactionStatusUseCase } from '../use-cases/transactions/get-transaction-status.use-case';
import { TransactionStatus } from '../../domain/models/transaction-status.enum';

@Injectable()
export class TransactionPollingService {
  private readonly logger = new Logger(TransactionPollingService.name);

  constructor(
    @Inject('TransactionRepository')
    private readonly transactionRepository: TransactionRepository,
    private readonly getTransactionStatusUseCase: GetTransactionStatusUseCase,
  ) {}

  // Ejecuta cada 20 segundos
  @Interval(10000)
  async pollPendingTransactions() {
    // Skip polling if no DATABASE_URL (using mocks)
    if (!process.env.DATABASE_URL) {
      this.logger.log('Skipping transaction polling (no database connection)');
      return;
    }

    this.logger.log(
      'Starting transaction polling to check pending transactions',
    );

    try {
      const pendingTransactions = await this.transactionRepository.findAll();
      const onlyPending = pendingTransactions.filter(
        (t) => t.status === TransactionStatus.PENDING && t.paymentId,
      );
      if (onlyPending.length === 0) {
        this.logger.log('No pending transactions to check');
        return;
      }
      for (const tx of onlyPending) {
        try {
          this.logger.log(`Consultando estado de transacción ${tx.paymentId}`);
          await this.getTransactionStatusUseCase.execute(tx.paymentId!);
        } catch (err) {
          this.logger.error(
            `Error actualizando transacción ${tx.paymentId!}: ${err}`,
          );
        }
      }
    } catch (error) {
      this.logger.error('Error in transaction polling:', error.message);
    }
  }
}
