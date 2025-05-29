import { Injectable, NotFoundException } from '@nestjs/common';
import { PaymentGatewayProvider } from 'src/adapters/out/external/payment/payment-gateway.provider';
import { TransactionRepository } from 'src/domain/ports-out/transaction.repository';
import { ProductRepository } from 'src/domain/ports-out/product.repository';
import { DeliveryRepository } from 'src/domain/ports-out/delivery.repository';
import { TransactionStatus } from 'src/domain/models/transaction-status.enum';
import { Inject } from '@nestjs/common';

@Injectable()
export class GetTransactionStatusUseCase {
  constructor(
    @Inject('TransactionRepository')
    private readonly transactionRepository: TransactionRepository,
    private readonly paymentProvider: PaymentGatewayProvider,
    @Inject('ProductRepository')
    private readonly productRepository: ProductRepository,
    @Inject('DeliveryRepository')
    private readonly deliveryRepository: DeliveryRepository,
  ) {}

  async execute(gatewayTransactionId: string): Promise<string> {
    // Buscar la transacción local por paymentId (id del gateway)
    const localTransaction =
      await this.transactionRepository.findByPaymentId(gatewayTransactionId);
    if (!localTransaction) {
      throw new NotFoundException(
        `No se encontró transacción local con paymentId ${gatewayTransactionId}`,
      );
    }

    // Consultar el estado en el gateway de pagos
    console.log(
      `Consultando estado en Payment Gateway para transacción ${gatewayTransactionId}`,
    );
    const gatewayStatus =
      await this.paymentProvider.getTransactionGatewayStatus(
        gatewayTransactionId,
        process.env.PAYMENT_API_URL!,
        process.env.PAYMENT_PRIVATE_KEY!,
      );
    const status = gatewayStatus.data.status;

    // Actualizar la transacción local con el nuevo estado
    await this.transactionRepository.updateStatus(
      localTransaction.id,
      status as TransactionStatus,
    );

    // Si la transacción fue aprobada, reducir el stock del producto
    if (status === 'APPROVED') {
      await this.productRepository.decreaseStock(
        localTransaction.productId,
        localTransaction.items,
      );
    }

    return status;
  }
}
