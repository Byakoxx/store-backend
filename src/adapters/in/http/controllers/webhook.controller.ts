import { Body, Controller, Post } from '@nestjs/common';
import { TransactionRepository } from 'src/domain/ports-out/transaction.repository';
import { ProductRepository } from 'src/domain/ports-out/product.repository';

@Controller('webhooks/payment')
export class WebhookController {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly productRepository: ProductRepository,
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
    }
  }
}
