import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TransactionsController } from '../controllers/transaction.controller';
import { CreateTransactionUseCase } from 'src/application/use-cases/create-transaction.use-case';
import { UpdateTransactionStatusUseCase } from 'src/application/use-cases/update-transaction-status.use-case';
import { GetTransactionStatusUseCase } from 'src/application/use-cases/transactions/get-transaction-status.use-case';
import { PaymentGatewayProvider } from 'src/adapters/out/external/payment/payment-gateway.provider';
import { TransactionPrismaRepository } from 'src/adapters/out/persistence/repositories/transaction.repository';
import { ProductPrismaRepository } from 'src/adapters/out/persistence/repositories/product.repository';
import { CustomerPrismaRepository } from 'src/adapters/out/persistence/repositories/customer.repository';
import { DeliveryPrismaRepository } from 'src/adapters/out/persistence/repositories/delivery.repository';
import { PrismaService } from 'src/adapters/out/persistence/prisma/prisma.service';
import { WebhookController } from '../controllers/webhook.controller';
import { TransactionPollingService } from 'src/application/services/transaction-polling.service';

@Module({
  imports: [HttpModule],
  controllers: [TransactionsController, WebhookController],
  providers: [
    CreateTransactionUseCase,
    UpdateTransactionStatusUseCase,
    GetTransactionStatusUseCase,
    TransactionPollingService,
    {
      provide: 'PaymentProvider',
      useClass: PaymentGatewayProvider,
    },
    {
      provide: 'TransactionRepository',
      useClass: TransactionPrismaRepository,
    },
    {
      provide: 'ProductRepository',
      useClass: ProductPrismaRepository,
    },
    {
      provide: 'CustomerRepository',
      useClass: CustomerPrismaRepository,
    },
    {
      provide: 'DeliveryRepository',
      useClass: DeliveryPrismaRepository,
    },
    PaymentGatewayProvider,
    PrismaService,
  ],
  exports: ['PaymentProvider'],
})
export class TransactionModule {}
