/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { TransactionPollingService } from './transaction-polling.service';
import { TransactionRepository } from 'src/domain/ports-out/transaction.repository';
import { GetTransactionStatusUseCase } from 'src/application/use-cases/transactions/get-transaction-status.use-case';
import { Transaction } from 'src/domain/models/transaction.entity';
import { TransactionStatus } from 'src/domain/models/transaction-status.enum';

describe('TransactionPollingService', () => {
  let service: TransactionPollingService;
  let mockTransactionRepository: jest.Mocked<TransactionRepository>;
  let mockGetTransactionStatusUseCase: jest.Mocked<GetTransactionStatusUseCase>;

  const mockPendingTransaction = new Transaction(
    'txn-1',
    TransactionStatus.PENDING,
    300000,
    'payment-123',
    'customer-1',
    'product-1',
    new Date('2024-01-01'),
    new Date('2024-01-01'),
    2,
  );

  const mockCreatedTransaction = new Transaction(
    'txn-2',
    TransactionStatus.CREATED,
    300000,
    null,
    'customer-1',
    'product-1',
    new Date('2024-01-01'),
    new Date('2024-01-01'),
    2,
  );

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionPollingService,
        {
          provide: 'TransactionRepository',
          useValue: {
            findAll: jest.fn(),
          },
        },
        {
          provide: GetTransactionStatusUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TransactionPollingService>(TransactionPollingService);
    mockTransactionRepository = module.get('TransactionRepository');
    mockGetTransactionStatusUseCase = module.get(GetTransactionStatusUseCase);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('pollPendingTransactions', () => {
    it('should process pending transactions with paymentId', async () => {
      const transactions = [mockPendingTransaction, mockCreatedTransaction];

      mockTransactionRepository.findAll.mockResolvedValue(transactions);
      mockGetTransactionStatusUseCase.execute.mockResolvedValue('APPROVED');

      await service.pollPendingTransactions();

      expect(mockTransactionRepository.findAll).toHaveBeenCalledTimes(1);
      expect(mockGetTransactionStatusUseCase.execute).toHaveBeenCalledTimes(1);
      expect(mockGetTransactionStatusUseCase.execute).toHaveBeenCalledWith(
        'payment-123',
      );
    });

    it('should skip transactions without paymentId', async () => {
      const transactions = [mockCreatedTransaction]; // No paymentId

      mockTransactionRepository.findAll.mockResolvedValue(transactions);

      await service.pollPendingTransactions();

      expect(mockTransactionRepository.findAll).toHaveBeenCalledTimes(1);
      expect(mockGetTransactionStatusUseCase.execute).not.toHaveBeenCalled();
    });

    it('should handle empty transaction list', async () => {
      mockTransactionRepository.findAll.mockResolvedValue([]);

      await service.pollPendingTransactions();

      expect(mockTransactionRepository.findAll).toHaveBeenCalledTimes(1);
      expect(mockGetTransactionStatusUseCase.execute).not.toHaveBeenCalled();
    });

    it('should handle errors when updating transaction status', async () => {
      const transactions = [mockPendingTransaction];

      mockTransactionRepository.findAll.mockResolvedValue(transactions);
      mockGetTransactionStatusUseCase.execute.mockRejectedValue(
        new Error('API Error'),
      );

      // Should not throw, just log error
      await expect(service.pollPendingTransactions()).resolves.not.toThrow();

      expect(mockTransactionRepository.findAll).toHaveBeenCalledTimes(1);
      expect(mockGetTransactionStatusUseCase.execute).toHaveBeenCalledWith(
        'payment-123',
      );
    });
  });
});
