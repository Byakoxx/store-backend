import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionRepository } from 'src/domain/ports-out/transaction.repository';
import { Transaction } from 'src/domain/models/transaction.entity';
import { Transaction as PrismaTransaction } from '@prisma/client';
import { TransactionStatus } from 'src/domain/models/transaction-status.enum';

@Injectable()
export class TransactionPrismaRepository implements TransactionRepository {
  constructor(private readonly prisma: PrismaService) {}
  async create(transaction: Transaction): Promise<Transaction> {
    const t: PrismaTransaction = await this.prisma.transaction.create({
      data: {
        id: transaction.id,
        status: transaction.status,
        amount: transaction.amount,
        paymentId: transaction.paymentId,
        customerId: transaction.customerId,
        productId: transaction.productId,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt,
      },
    });

    return this.toDomain(t);
  }
  async findById(id: string): Promise<Transaction | null> {
    const t: PrismaTransaction | null =
      await this.prisma.transaction.findUnique({ where: { id } });

    if (!t) {
      throw new NotFoundException('Transaction not found');
    }

    return this.toDomain(t);
  }
  async updateStatus(
    id: string,
    status: TransactionStatus,
    paymentId?: string,
  ): Promise<Transaction | null> {
    const exists = await this.prisma.transaction.findUnique({ where: { id } });
    if (!exists) {
      throw new NotFoundException('Transaction not found');
    }
    const t: PrismaTransaction | null = await this.prisma.transaction.update({
      where: { id },
      data: {
        status,
        paymentId,
        updatedAt: new Date(),
      },
    });
    return t ? this.toDomain(t) : null;
  }

  private toDomain(t: PrismaTransaction): Transaction {
    return new Transaction(
      t.id,
      t.status as TransactionStatus,
      t.amount,
      t.paymentId,
      t.customerId,
      t.productId,
      t.createdAt,
      t.updatedAt,
    );
  }
}
