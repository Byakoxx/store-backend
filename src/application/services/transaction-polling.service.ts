import { Inject, Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { TransactionRepository } from 'src/domain/ports-out/transaction.repository';
import { GetTransactionStatusUseCase } from '../use-cases/transactions/get-transaction-status.use-case';
import { TransactionStatus } from 'src/domain/models/transaction-status.enum';

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
    this.logger.log('Iniciando polling de transacciones PENDING...');
    const pendingTransactions = await this.transactionRepository.findAll();
    const onlyPending = pendingTransactions.filter(
      (t) => t.status === TransactionStatus.PENDING && t.paymentId,
    );
    for (const tx of onlyPending) {
      console.log('tx', tx);
      try {
        this.logger.log(`Consultando estado de transacción ${tx.paymentId}`);
        await this.getTransactionStatusUseCase.execute(tx.paymentId!);
      } catch (err) {
        this.logger.error(
          `Error actualizando transacción ${tx.paymentId!}: ${err}`,
        );
      }
    }
  }
}
