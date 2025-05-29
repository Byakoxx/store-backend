import { Module } from '@nestjs/common';
import { ProductModule } from './adapters/in/http/modules/product.module';
import { TransactionModule } from './adapters/in/http/modules/transaction.module';

@Module({
  imports: [ProductModule, TransactionModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
