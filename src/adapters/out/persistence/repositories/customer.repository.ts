import { Injectable } from '@nestjs/common';
import { CustomerRepository } from 'src/domain/ports-out/customer.repository';
import { PrismaService } from '../prisma/prisma.service';
import { Customer as PrismaCustomer } from '@prisma/client';
import { Customer } from 'src/domain/models/customer.entity';

@Injectable()
export class CustomerPrismaRepository implements CustomerRepository {
  constructor(private readonly prisma: PrismaService) {}
  async findBy(id: string): Promise<Customer | null> {
    const c: PrismaCustomer | null = await this.prisma.customer.findUnique({
      where: {
        id,
      },
    });
    if (!c) return null;

    return new Customer(c.id, c.name, c.createdAt, c.updatedAt);
  }
  async findByName(name: string): Promise<Customer | null> {
    const c: PrismaCustomer | null = await this.prisma.customer.findFirst({
      where: {
        name,
      },
    });
    if (!c) return null;

    return new Customer(c.id, c.name, c.createdAt, c.updatedAt);
  }
  async create(customer: Customer): Promise<Customer> {
    const c: PrismaCustomer = await this.prisma.customer.create({
      data: {
        id: customer.id,
        name: customer.name,
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt,
      },
    });

    return new Customer(c.id, c.name, c.createdAt, c.updatedAt);
  }
}
