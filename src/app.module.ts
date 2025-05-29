import { Module } from '@nestjs/common';
import { ProductModule } from './adapters/in/http/modules/product.module';
import { TransactionModule } from './adapters/in/http/modules/transaction.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [ProductModule, TransactionModule, ScheduleModule.forRoot()],
  controllers: [],
  providers: [],
})
export class AppModule {}
