import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';

import { WompiPaymentProvider } from 'src/adapters/out/external/wompi/wompi-payment.provider';
import { TransactionRepository } from 'src/domain/ports-out/transaction.repository';
import { ProductRepository } from 'src/domain/ports-out/product.repository';
import { Delivery } from 'src/domain/models/delivery.entity';
import { DeliveryRepository } from 'src/domain/ports-out/delivery.repository';

@Injectable()
export class GetTransactionStatusUseCase {
  private readonly logger = new Logger(GetTransactionStatusUseCase.name);

  constructor(
    private readonly wompiProvider: WompiPaymentProvider,
    @Inject('TransactionRepository')
    private readonly transactionRepository: TransactionRepository,
    @Inject('ProductRepository')
    private readonly productRepository: ProductRepository,
    @Inject('DeliveryRepository')
    private readonly deliveryRepository: DeliveryRepository,
  ) {}

  async execute(wompiTransactionId: string): Promise<string> {
    // Buscar la transacción local por paymentId (id de wompi)
    const transaction =
      await this.transactionRepository.findByPaymentId(wompiTransactionId);
    if (!transaction) {
      this.logger.error(
        `No se encontró transacción local con paymentId ${wompiTransactionId}`,
      );
      throw new NotFoundException('Transaction not found');
    }

    this.logger.log(
      `Consultando estado en Wompi para transacción ${wompiTransactionId}`,
    );
    const wompiStatus = await this.wompiProvider.getTransactionWompiStatus(
      wompiTransactionId,
      process.env.WOMPI_API_URL!,
      process.env.WOMPI_PRIVATE_KEY!,
    );
    const status = wompiStatus.data.status;

    this.logger.log(
      `Actualizando estado en DB para transacción ${transaction.id}: ${status}`,
    );
    await this.transactionRepository.updateStatus(transaction.id, status);

    if (status === 'APPROVED' && transaction.items > 0) {
      await this.productRepository.decreaseStock(
        transaction.productId,
        transaction.items,
      );

      // Crear delivery
      await this.deliveryRepository.create(
        new Delivery(
          crypto.randomUUID(),
          'PENDING',
          'Dirección de entrega',
          null,
          transaction.id,
          new Date(),
          new Date(),
          transaction.customerId,
        ),
      );
    }

    return status;
  }
}
