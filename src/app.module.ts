import { Module } from '@nestjs/common';
import { ProductModule } from './adapters/in/http/modules/product.module';
import { TransactionModule } from './adapters/in/http/modules/transaction.module';
import { DeliveryModule } from './adapters/in/http/modules/delivery.module';
import { ScheduleModule } from '@nestjs/schedule';
import { HealthController } from './adapters/in/http/controllers/health.controller';

@Module({
  imports: [
    ProductModule,
    TransactionModule,
    DeliveryModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
