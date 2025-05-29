import { Injectable, NotFoundException } from '@nestjs/common';
import { TransactionRepository } from '../../../../domain/ports-out/transaction.repository';
import { Transaction } from '../../../../domain/models/transaction.entity';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionStatus } from '../../../../domain/models/transaction-status.enum';
import { Transaction as PrismaTransaction } from '@prisma/client';

@Injectable()
export class TransactionPrismaRepository implements TransactionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(transaction: Transaction): Promise<Transaction> {
    if (!this.prisma) {
      console.log('🔄 Mock transaction create (no database)');
      return transaction;
    }

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
        items: transaction.items,
      },
    });

    return this.toDomain(t);
  }

  async findById(id: string): Promise<Transaction | null> {
    if (!this.prisma) {
      console.log(`🔄 Mock transaction findById ${id} (no database)`);
      return null;
    }

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
    if (!this.prisma) {
      console.log(
        `🔄 Mock transaction status update ${id} to ${status} (no database)`,
      );
      return null;
    }

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

  async findAll(): Promise<Transaction[]> {
    if (!this.prisma) {
      console.log('🔄 Mock all transactions (no database)');
      return [];
    }

    const transactions = await this.prisma.transaction.findMany();
    return transactions.map((t) => this.toDomain(t));
  }

  async findByPaymentId(paymentId: string): Promise<Transaction | null> {
    if (!this.prisma) {
      console.log(`🔄 Mock findByPaymentId ${paymentId} (no database)`);
      return null;
    }

    const t = await this.prisma.transaction.findFirst({ where: { paymentId } });
    if (!t) return null;
    return this.toDomain(t);
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
      t.items,
    );
  }
}
