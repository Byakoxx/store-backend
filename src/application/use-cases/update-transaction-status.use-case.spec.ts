/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { UpdateTransactionStatusUseCase } from './update-transaction-status.use-case';
import { TransactionRepository } from 'src/domain/ports-out/transaction.repository';
import { Transaction } from 'src/domain/models/transaction.entity';
import { TransactionStatus } from 'src/domain/models/transaction-status.enum';
import { NotFoundException } from '@nestjs/common';

describe('UpdateTransactionStatusUseCase', () => {
  let useCase: UpdateTransactionStatusUseCase;
  let mockTransactionRepository: jest.Mocked<TransactionRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateTransactionStatusUseCase,
        {
          provide: 'TransactionRepository',
          useValue: {
            updateStatus: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<UpdateTransactionStatusUseCase>(
      UpdateTransactionStatusUseCase,
    );
    mockTransactionRepository = module.get('TransactionRepository');
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should update transaction status to approved', async () => {
    const updatedTransaction = new Transaction(
      'txn-1',
      TransactionStatus.APPROVED,
      300000,
      'payment-123',
      'customer-1',
      'product-1',
      new Date('2024-01-01'),
      new Date('2024-01-01'),
      2,
    );

    mockTransactionRepository.updateStatus.mockResolvedValue(
      updatedTransaction,
    );

    const result = await useCase.execute(
      'txn-1',
      TransactionStatus.APPROVED,
      'payment-123',
    );

    expect(result).toEqual(updatedTransaction);
    expect(mockTransactionRepository.updateStatus).toHaveBeenCalledWith(
      'txn-1',
      TransactionStatus.APPROVED,
      'payment-123',
    );
  });

  it('should update transaction status to declined without paymentId', async () => {
    const updatedTransaction = new Transaction(
      'txn-1',
      TransactionStatus.DECLINED,
      300000,
      null,
      'customer-1',
      'product-1',
      new Date('2024-01-01'),
      new Date('2024-01-01'),
      2,
    );

    mockTransactionRepository.updateStatus.mockResolvedValue(
      updatedTransaction,
    );

    const result = await useCase.execute('txn-1', TransactionStatus.DECLINED);

    expect(result).toEqual(updatedTransaction);
    expect(mockTransactionRepository.updateStatus).toHaveBeenCalledWith(
      'txn-1',
      TransactionStatus.DECLINED,
      undefined,
    );
  });

  it('should throw NotFoundException when transaction not found', async () => {
    mockTransactionRepository.updateStatus.mockResolvedValue(null);

    await expect(
      useCase.execute('non-existent', TransactionStatus.APPROVED),
    ).rejects.toThrow(NotFoundException);

    expect(mockTransactionRepository.updateStatus).toHaveBeenCalledWith(
      'non-existent',
      TransactionStatus.APPROVED,
      undefined,
    );
  });
});
