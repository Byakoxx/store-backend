import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/adapters/out/persistence/prisma/prisma.module';
import { TransactionPrismaRepository } from 'src/adapters/out/persistence/repositories/transaction.repository';
import { CreateTransactionUseCase } from 'src/application/use-cases/create-transaction.use-case';
import { TransactionsController } from '../controllers/transaction.controller';
import { CustomerPrismaRepository } from 'src/adapters/out/persistence/repositories/customer.repository';
import { UpdateTransactionStatusUseCase } from 'src/application/use-cases/update-transaction-status.use-case';
import { WompiPaymentProvider } from 'src/adapters/out/external/wompi/wompi-payment.provider';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [PrismaModule, HttpModule],
  controllers: [TransactionsController],
  providers: [
    {
      provide: 'TransactionRepository',
      useClass: TransactionPrismaRepository,
    },
    {
      provide: 'CustomerRepository',
      useClass: CustomerPrismaRepository,
    },
    {
      provide: 'PaymentProviderPort',
      useClass: WompiPaymentProvider,
    },
    WompiPaymentProvider,
    CreateTransactionUseCase,
    UpdateTransactionStatusUseCase,
  ],
  exports: ['TransactionRepository'],
})
export class TransactionModule {}
