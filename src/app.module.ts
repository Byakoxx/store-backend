import { Module } from '@nestjs/common';
import { ProductModule } from './adapters/in/http/modules/product.module';
import { TransactionModule } from './adapters/in/http/modules/transaction.module';
import { PaymentModule } from './adapters/in/http/modules/payment.module';

@Module({
  imports: [ProductModule, TransactionModule, PaymentModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
