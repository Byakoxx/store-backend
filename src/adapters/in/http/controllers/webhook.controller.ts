import { Body, Controller, HttpCode, Inject, Post } from '@nestjs/common';
import { TransactionRepository } from 'src/domain/ports-out/transaction.repository';
import { ProductRepository } from 'src/domain/ports-out/product.repository';

@Controller('webhooks/wompi')
export class WebhookController {
  constructor(
    @Inject('TransactionRepository')
    private readonly transactionRepository: TransactionRepository,
    @Inject('ProductRepository')
    private readonly productRepository: ProductRepository,
  ) {}

  @Post()
  @HttpCode(200)
  async handleWompiWebhook(@Body() body: any): Promise<void> {
    // Wompi envía el evento en body.data.transaction
    const transactionId = body?.data?.transaction?.id;
    const status = body?.data?.transaction?.status;
    if (transactionId && status) {
      // Busca la transacción local por paymentId (id de wompi)
      const tx =
        await this.transactionRepository.findByPaymentId(transactionId);
      if (tx) {
        await this.transactionRepository.updateStatus(tx.id, status);
        if (status === 'APPROVED' && tx.items > 0) {
          await this.productRepository.decreaseStock(tx.productId, tx.items);
        }
      }
    }
    // Siempre responde 200 OK
  }
}
