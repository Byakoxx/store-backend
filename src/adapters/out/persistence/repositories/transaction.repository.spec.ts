import { Test, TestingModule } from '@nestjs/testing';
import { TransactionPrismaRepository } from './transaction.repository';
import { PrismaService } from '../prisma/prisma.service';
import { Transaction } from 'src/domain/models/transaction.entity';
import { TransactionStatus } from 'src/domain/models/transaction-status.enum';

describe('TransactionPrismaRepository', () => {
  let repository: TransactionPrismaRepository;
  let mockPrismaService: any;

  const mockPrismaTransaction = {
    id: 'txn-1',
    status: 'PENDING',
    amount: 300000,
    paymentId: 'payment-123',
    customerId: 'customer-1',
    productId: 'product-1',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    items: 2,
  };

  beforeEach(async () => {
    mockPrismaService = {
      transaction: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionPrismaRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<TransactionPrismaRepository>(
      TransactionPrismaRepository,
    );
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create a transaction successfully', async () => {
      mockPrismaService.transaction.create.mockResolvedValue(
        mockPrismaTransaction,
      );

      const transactionData = {
        id: 'txn-1',
        status: TransactionStatus.PENDING,
        amount: 300000,
        paymentId: 'payment-123',
        customerId: 'customer-1',
        productId: 'product-1',
        items: 2,
      };

      const result = await repository.create(transactionData as Transaction);

      expect(result).toBeInstanceOf(Transaction);
      expect(result.id).toBe('txn-1');
      expect(mockPrismaService.transaction.create).toHaveBeenCalledWith({
        data: transactionData,
      });
    });
  });

  describe('findAll', () => {
    it('should return an array of transactions', async () => {
      mockPrismaService.transaction.findMany.mockResolvedValue([
        mockPrismaTransaction,
      ]);

      const result = await repository.findAll();

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Transaction);
      expect(result[0].id).toBe('txn-1');
      expect(mockPrismaService.transaction.findMany).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no transactions found', async () => {
      mockPrismaService.transaction.findMany.mockResolvedValue([]);

      const result = await repository.findAll();

      expect(result).toEqual([]);
      expect(mockPrismaService.transaction.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('findByPaymentId', () => {
    it('should return a transaction when found', async () => {
      mockPrismaService.transaction.findFirst.mockResolvedValue(
        mockPrismaTransaction,
      );

      const result = await repository.findByPaymentId('payment-123');

      expect(result).toBeInstanceOf(Transaction);
      expect(result?.paymentId).toBe('payment-123');
      expect(mockPrismaService.transaction.findFirst).toHaveBeenCalledWith({
        where: { paymentId: 'payment-123' },
      });
    });

    it('should return null when transaction not found', async () => {
      mockPrismaService.transaction.findFirst.mockResolvedValue(null);

      const result = await repository.findByPaymentId('non-existent');

      expect(result).toBeNull();
      expect(mockPrismaService.transaction.findFirst).toHaveBeenCalledWith({
        where: { paymentId: 'non-existent' },
      });
    });
  });

  describe('updateStatus', () => {
    it('should update transaction status successfully', async () => {
      const updatedTransaction = {
        ...mockPrismaTransaction,
        status: 'APPROVED',
      };

      // Mock that transaction exists
      mockPrismaService.transaction.findUnique.mockResolvedValue(
        mockPrismaTransaction,
      );
      mockPrismaService.transaction.update.mockResolvedValue(
        updatedTransaction,
      );

      const result = await repository.updateStatus(
        'txn-1',
        TransactionStatus.APPROVED,
        'payment-123',
      );

      expect(result).toBeInstanceOf(Transaction);
      expect(result?.status).toBe(TransactionStatus.APPROVED);
      expect(mockPrismaService.transaction.findUnique).toHaveBeenCalledWith({
        where: { id: 'txn-1' },
      });
      expect(mockPrismaService.transaction.update).toHaveBeenCalledWith({
        where: { id: 'txn-1' },
        data: {
          status: TransactionStatus.APPROVED,
          paymentId: 'payment-123',
          updatedAt: expect.any(Date),
        },
      });
    });

    it('should update transaction status without paymentId', async () => {
      const updatedTransaction = {
        ...mockPrismaTransaction,
        status: 'DECLINED',
      };

      mockPrismaService.transaction.findUnique.mockResolvedValue(
        mockPrismaTransaction,
      );
      mockPrismaService.transaction.update.mockResolvedValue(
        updatedTransaction,
      );

      const result = await repository.updateStatus(
        'txn-1',
        TransactionStatus.DECLINED,
      );

      expect(result).toBeInstanceOf(Transaction);
      expect(mockPrismaService.transaction.update).toHaveBeenCalledWith({
        where: { id: 'txn-1' },
        data: {
          status: TransactionStatus.DECLINED,
          paymentId: undefined,
          updatedAt: expect.any(Date),
        },
      });
    });
  });
});
