/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { WebhookController } from './webhook.controller';
import { TransactionRepository } from 'src/domain/ports-out/transaction.repository';
import { ProductRepository } from 'src/domain/ports-out/product.repository';
import { Transaction } from 'src/domain/models/transaction.entity';
import { TransactionStatus } from 'src/domain/models/transaction-status.enum';

describe('WebhookController', () => {
  let controller: WebhookController;
  let mockTransactionRepository: jest.Mocked<TransactionRepository>;
  let mockProductRepository: jest.Mocked<ProductRepository>;

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
      controllers: [WebhookController],
      providers: [
        {
          provide: 'TransactionRepository',
          useValue: {
            findByPaymentId: jest.fn(),
            updateStatus: jest.fn(),
          },
        },
        {
          provide: 'ProductRepository',
          useValue: {
            decreaseStock: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<WebhookController>(WebhookController);
    mockTransactionRepository = module.get('TransactionRepository');
    mockProductRepository = module.get('ProductRepository');
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('handlePaymentWebhook', () => {
    it('should handle webhook for approved transaction', async () => {
      const webhookPayload = {
        data: {
          transaction: {
            id: 'payment-123',
            status: 'APPROVED',
          },
        },
      };

      mockTransactionRepository.findByPaymentId.mockResolvedValue(
        mockTransaction,
      );
      mockTransactionRepository.updateStatus.mockResolvedValue(mockTransaction);
      mockProductRepository.decreaseStock.mockResolvedValue({} as any);

      await controller.handlePaymentWebhook(webhookPayload);

      expect(mockTransactionRepository.findByPaymentId).toHaveBeenCalledWith(
        'payment-123',
      );
      expect(mockTransactionRepository.updateStatus).toHaveBeenCalledWith(
        'txn-1',
        'APPROVED',
      );
      expect(mockProductRepository.decreaseStock).toHaveBeenCalledWith(
        'product-1',
        2,
      );
    });

    it('should handle webhook for declined transaction without decreasing stock', async () => {
      const webhookPayload = {
        data: {
          transaction: {
            id: 'payment-456',
            status: 'DECLINED',
          },
        },
      };

      mockTransactionRepository.findByPaymentId.mockResolvedValue(
        mockTransaction,
      );
      mockTransactionRepository.updateStatus.mockResolvedValue(mockTransaction);

      await controller.handlePaymentWebhook(webhookPayload);

      expect(mockTransactionRepository.findByPaymentId).toHaveBeenCalledWith(
        'payment-456',
      );
      expect(mockTransactionRepository.updateStatus).toHaveBeenCalledWith(
        'txn-1',
        'DECLINED',
      );
      expect(mockProductRepository.decreaseStock).not.toHaveBeenCalled();
    });

    it('should handle webhook when transaction is not found', async () => {
      const webhookPayload = {
        data: {
          transaction: {
            id: 'payment-999',
            status: 'APPROVED',
          },
        },
      };

      mockTransactionRepository.findByPaymentId.mockResolvedValue(null);

      await controller.handlePaymentWebhook(webhookPayload);

      expect(mockTransactionRepository.findByPaymentId).toHaveBeenCalledWith(
        'payment-999',
      );
      expect(mockTransactionRepository.updateStatus).not.toHaveBeenCalled();
      expect(mockProductRepository.decreaseStock).not.toHaveBeenCalled();
    });

    it('should handle malformed webhook payload', async () => {
      const webhookPayload = {
        malformed: 'data',
      };

      await controller.handlePaymentWebhook(webhookPayload);

      expect(mockTransactionRepository.findByPaymentId).not.toHaveBeenCalled();
      expect(mockTransactionRepository.updateStatus).not.toHaveBeenCalled();
      expect(mockProductRepository.decreaseStock).not.toHaveBeenCalled();
    });
  });
});
