import { Injectable } from '@nestjs/common';

import { WompiPaymentProvider } from 'src/adapters/out/external/wompi/wompi-payment.provider';
import { TransactionRepository } from 'src/domain/ports-out/transaction.repository';

@Injectable()
export class GetTransactionStatusUseCase {
  constructor(
    private readonly wompiProvider: WompiPaymentProvider,
    private readonly transactionRepository: TransactionRepository,
  ) {}

  async execute(transactionId: string): Promise<string> {
    const wompiStatus = await this.wompiProvider.getTransactionWompiStatus(
      transactionId,
      process.env.WOMPI_API_URL!,
      process.env.WOMPI_PRIVATE_KEY!,
    );
    const status = wompiStatus.data.status;

    await this.transactionRepository.updateStatus(transactionId, status);

    return status;
  }
}
