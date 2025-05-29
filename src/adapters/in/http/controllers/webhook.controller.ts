import { Body, Controller, HttpCode, Inject, Post } from '@nestjs/common';
import { TransactionRepository } from 'src/domain/ports-out/transaction.repository';

@Controller('webhooks/wompi')
export class WebhookController {
  constructor(
    @Inject('TransactionRepository')
    private readonly transactionRepository: TransactionRepository,
  ) {}

  @Post()
  @HttpCode(200)
  async handleWompiWebhook(@Body() body: any): Promise<{
    status: string;
    statusCode: number;
    message: string;
  }> {
    // Wompi envía el evento en body.data.transaction
    const transactionId = body?.data?.transaction?.id;
    const status = body?.data?.transaction?.status;
    if (transactionId && status) {
      const tx =
        await this.transactionRepository.findByPaymentId(transactionId);
      if (tx) {
        await this.transactionRepository.updateStatus(tx.id, status);
      }
    }
    return {
      status: 'success',
      statusCode: 200,
      message: 'Webhook received',
    };
  }
}
