import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DeliveryRepository } from 'src/domain/ports-out/delivery.repository';
import { Delivery } from 'src/domain/models/delivery.entity';
import { DeliveryStatus } from 'src/domain/models/delivery-status.enum';

@Injectable()
export class DeliveryPrismaRepository implements DeliveryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(delivery: Delivery): Promise<Delivery> {
    const d = await this.prisma.delivery.create({
      data: {
        id: delivery.id,
        status: delivery.status,
        country: delivery.country,
        city: delivery.city,
        address: delivery.address,
        zipCode: delivery.zipCode,
        trackingCode: delivery.trackingCode,
        transactionId: delivery.transactionId,
        createdAt: delivery.createdAt,
        updatedAt: delivery.updatedAt,
        customerId: delivery.customerId,
      },
    });
    return new Delivery(
      d.id,
      d.status as DeliveryStatus,
      d.country,
      d.city,
      d.address,
      d.zipCode,
      d.trackingCode,
      d.transactionId,
      d.createdAt,
      d.updatedAt,
      d.customerId,
    );
  }

  async updateStatus(
    transactionId: string,
    status: DeliveryStatus,
  ): Promise<Delivery | null> {
    try {
      const d = await this.prisma.delivery.update({
        where: { transactionId },
        data: {
          status,
          updatedAt: new Date(),
        },
      });
      return new Delivery(
        d.id,
        d.status as DeliveryStatus,
        d.country,
        d.city,
        d.address,
        d.zipCode,
        d.trackingCode,
        d.transactionId,
        d.createdAt,
        d.updatedAt,
        d.customerId,
      );
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async findByTransactionId(transactionId: string): Promise<Delivery | null> {
    const d = await this.prisma.delivery.findUnique({
      where: { transactionId },
    });
    if (!d) return null;

    return new Delivery(
      d.id,
      d.status as DeliveryStatus,
      d.country,
      d.city,
      d.address,
      d.zipCode,
      d.trackingCode,
      d.transactionId,
      d.createdAt,
      d.updatedAt,
      d.customerId,
    );
  }
}
