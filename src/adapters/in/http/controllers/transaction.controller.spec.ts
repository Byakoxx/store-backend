/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsController } from './transaction.controller';
import { CreateTransactionUseCase } from 'src/application/use-cases/create-transaction.use-case';
import { UpdateTransactionStatusUseCase } from 'src/application/use-cases/update-transaction-status.use-case';
import { TransactionRepository } from 'src/domain/ports-out/transaction.repository';
import { CreateTransactionDto } from 'src/shared/dto/create-transaction.dto';
import { UpdateTransactionStatusDto } from 'src/shared/dto/update-transaction-status.dto';
import { Transaction } from 'src/domain/models/transaction.entity';
import { TransactionStatus } from 'src/domain/models/transaction-status.enum';

describe('TransactionsController', () => {
  let controller: TransactionsController;
  let mockCreateTransactionUseCase: jest.Mocked<CreateTransactionUseCase>;
  let mockUpdateTransactionStatusUseCase: jest.Mocked<UpdateTransactionStatusUseCase>;
  let mockTransactionRepository: jest.Mocked<TransactionRepository>;

  const mockTransaction = new Transaction(
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        {
          provide: CreateTransactionUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: UpdateTransactionStatusUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: 'TransactionRepository',
          useValue: {
            findAll: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<TransactionsController>(TransactionsController);
    mockCreateTransactionUseCase = module.get(CreateTransactionUseCase);
    mockUpdateTransactionStatusUseCase = module.get(
      UpdateTransactionStatusUseCase,
    );
    mockTransactionRepository = module.get('TransactionRepository');
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a transaction', async () => {
      const createDto: CreateTransactionDto = {
        productId: 'product-1',
        amount: 300000,
        currency: 'COP',
        paymentToken: 'token-123',
        customer: { name: 'John Doe', email: 'john@example.com' },
        items: 2,
        delivery: {
          country: 'Colombia',
          city: 'Bogotá',
          address: 'Calle 123',
          zipCode: '110111',
        },
      };

      mockCreateTransactionUseCase.execute.mockResolvedValue(mockTransaction);

      const result = await controller.create(createDto);

      expect(result).toBe(mockTransaction);
      expect(mockCreateTransactionUseCase.execute).toHaveBeenCalledWith(
        createDto,
      );
    });
  });

  describe('updateStatus', () => {
    it('should update transaction status', async () => {
      const updateDto: UpdateTransactionStatusDto = {
        status: TransactionStatus.APPROVED,
      };

      mockUpdateTransactionStatusUseCase.execute.mockResolvedValue(
        mockTransaction,
      );

      const result = await controller.updateStatus('txn-1', updateDto);

      expect(result).toBe(mockTransaction);
      expect(mockUpdateTransactionStatusUseCase.execute).toHaveBeenCalledWith(
        'txn-1',
        TransactionStatus.APPROVED,
        undefined,
      );
    });
  });

  describe('findAll', () => {
    it('should return all transactions', async () => {
      const transactions = [mockTransaction];
      mockTransactionRepository.findAll.mockResolvedValue(transactions);

      const result = await controller.findAll();

      expect(result).toBe(transactions);
      expect(mockTransactionRepository.findAll).toHaveBeenCalledTimes(1);
    });
  });
});
