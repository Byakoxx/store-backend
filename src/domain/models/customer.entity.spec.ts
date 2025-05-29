import { Customer } from './customer.entity';

describe('Customer Entity', () => {
  const mockDate = new Date('2024-01-01');

  it('should create a customer instance', () => {
    const customer = new Customer('customer-1', 'John Doe', mockDate, mockDate);

    expect(customer.id).toBe('customer-1');
    expect(customer.name).toBe('John Doe');
    expect(customer.createdAt).toBe(mockDate);
    expect(customer.updatedAt).toBe(mockDate);
  });

  it('should allow modification of mutable properties', () => {
    const customer = new Customer(
      'customer-2',
      'Jane Smith',
      mockDate,
      mockDate,
    );

    customer.name = 'Jane Doe';

    expect(customer.name).toBe('Jane Doe');
    expect(customer.id).toBe('customer-2'); // id should remain readonly
  });
});
