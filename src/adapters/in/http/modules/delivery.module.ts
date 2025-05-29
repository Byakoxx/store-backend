import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/adapters/out/persistence/prisma/prisma.module';
import { DeliveryPrismaRepository } from 'src/adapters/out/persistence/repositories/delivery.repository';
import { DeliveryController } from '../controllers/delivery.controller';

@Module({
  imports: [PrismaModule],
  controllers: [DeliveryController],
  providers: [
    {
      provide: 'DeliveryRepository',
      useClass: DeliveryPrismaRepository,
    },
  ],
  exports: ['DeliveryRepository'],
})
export class DeliveryModule {}
