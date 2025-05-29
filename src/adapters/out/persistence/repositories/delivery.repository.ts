import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DeliveryRepository } from 'src/domain/ports-out/delivery.repository';
import { Delivery } from 'src/domain/models/delivery.entity';

@Injectable()
export class DeliveryPrismaRepository implements DeliveryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(delivery: Delivery): Promise<Delivery> {
    const d = await this.prisma.delivery.create({
      data: {
        id: delivery.id,
        status: delivery.status,
        address: delivery.address,
        trackingCode: delivery.trackingCode,
        transactionId: delivery.transactionId,
        createdAt: delivery.createdAt,
        updatedAt: delivery.updatedAt,
        customerId: delivery.customerId,
      },
    });
    return new Delivery(
      d.id,
      d.status,
      d.address,
      d.trackingCode,
      d.transactionId,
      d.createdAt,
      d.updatedAt,
      d.customerId,
    );
  }
}
