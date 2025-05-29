import { Body, Controller, Post, Inject } from '@nestjs/common';
import { TransactionRepository } from 'src/domain/ports-out/transaction.repository';
import { ProductRepository } from 'src/domain/ports-out/product.repository';
import { DeliveryRepository } from 'src/domain/ports-out/delivery.repository';
import { DeliveryStatus } from 'src/domain/models/delivery-status.enum';

@Controller('webhooks/payment')
export class WebhookController {
  constructor(
    @Inject('TransactionRepository')
    private readonly transactionRepository: TransactionRepository,
    @Inject('ProductRepository')
    private readonly productRepository: ProductRepository,
    @Inject('DeliveryRepository')
    private readonly deliveryRepository: DeliveryRepository,
  ) {}

  @Post()
  async handlePaymentWebhook(@Body() body: any): Promise<void> {
    const transactionData = body.data?.transaction;
    if (!transactionData) return;

    const transaction = await this.transactionRepository.findByPaymentId(
      transactionData.id,
    );
    if (!transaction) return;

    await this.transactionRepository.updateStatus(
      transaction.id,
      transactionData.status,
    );

    if (transactionData.status === 'APPROVED') {
      await this.productRepository.decreaseStock(
        transaction.productId,
        transaction.items,
      );

      await this.deliveryRepository.updateStatus(
        transaction.id,
        DeliveryStatus.PREPARING,
      );
    }
  }
}
