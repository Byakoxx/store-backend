import { Transaction } from './transaction.entity';
import { TransactionStatus } from './transaction-status.enum';

describe('Transaction Entity', () => {
  const mockDate = new Date('2024-01-01');

  it('should create a transaction instance', () => {
    const transaction = new Transaction(
      'txn-1',
      TransactionStatus.PENDING,
      300000,
      'payment-123',
      'customer-1',
      'product-1',
      mockDate,
      mockDate,
      2,
    );

    expect(transaction.id).toBe('txn-1');
    expect(transaction.status).toBe(TransactionStatus.PENDING);
    expect(transaction.amount).toBe(300000);
    expect(transaction.paymentId).toBe('payment-123');
    expect(transaction.customerId).toBe('customer-1');
    expect(transaction.productId).toBe('product-1');
    expect(transaction.createdAt).toBe(mockDate);
    expect(transaction.updatedAt).toBe(mockDate);
    expect(transaction.items).toBe(2);
  });

  it('should create a transaction with null paymentId', () => {
    const transaction = new Transaction(
      'txn-2',
      TransactionStatus.CREATED,
      150000,
      null,
      'customer-2',
      'product-2',
      mockDate,
      mockDate,
      1,
    );

    expect(transaction.paymentId).toBeNull();
    expect(transaction.status).toBe(TransactionStatus.CREATED);
  });

  it('should allow modification of mutable properties', () => {
    const transaction = new Transaction(
      'txn-3',
      TransactionStatus.CREATED,
      100000,
      null,
      'customer-3',
      'product-3',
      mockDate,
      mockDate,
      1,
    );

    transaction.status = TransactionStatus.APPROVED;
    transaction.amount = 200000;
    transaction.items = 3;

    expect(transaction.status).toBe(TransactionStatus.APPROVED);
    expect(transaction.amount).toBe(200000);
    expect(transaction.items).toBe(3);
  });
});
