import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PaymentController } from '../controllers/payment.controller';
import { WompiPaymentProvider } from 'src/adapters/out/external/wompi/wompi-payment.provider';
import { ProcessPaymentUseCase } from 'src/application/use-cases/process-payment.use-case';

@Module({
  imports: [HttpModule],
  controllers: [PaymentController],
  providers: [
    {
      provide: 'PaymentProviderPort',
      useClass: WompiPaymentProvider,
    },
    ProcessPaymentUseCase,
    WompiPaymentProvider,
  ],
  exports: [ProcessPaymentUseCase],
})
export class PaymentModule {}
