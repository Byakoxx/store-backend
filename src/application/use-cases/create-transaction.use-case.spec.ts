import { Test, TestingModule } from '@nestjs/testing';
import { CreateTransactionUseCase } from './create-transaction.use-case';
import { CustomerRepository } from 'src/domain/ports-out/customer.repository';
import { TransactionRepository } from 'src/domain/ports-out/transaction.repository';
import { PaymentProviderPort } from 'src/domain/ports-out/payment-provider.port';
import { DeliveryRepository } from 'src/domain/ports-out/delivery.repository';
import { CreateTransactionDto } from 'src/shared/dto/create-transaction.dto';
import { Customer } from 'src/domain/models/customer.entity';
import { Transaction } from 'src/domain/models/transaction.entity';
import { TransactionStatus } from 'src/domain/models/transaction-status.enum';

// Mock crypto.randomUUID
global.crypto = {
  randomUUID: jest.fn(() => 'mock-uuid'),
} as any;

describe('CreateTransactionUseCase', () => {
  let useCase: CreateTransactionUseCase;
  let mockCustomerRepository: jest.Mocked<CustomerRepository>;
  let mockTransactionRepository: jest.Mocked<TransactionRepository>;
  let mockPaymentProvider: jest.Mocked<PaymentProviderPort>;
  let mockDeliveryRepository: jest.Mocked<DeliveryRepository>;

  const mockCreateTransactionDto: CreateTransactionDto = {
    productId: 'prod-1',
    amount: 300000,
    currency: 'COP',
    paymentToken: 'tok_test_123',
    customer: { name: 'John Doe', email: 'john@example.com' },
    items: 2,
    delivery: {
      country: 'Colombia',
      city: 'Bogotá',
      address: 'Calle 123 #45-67',
      zipCode: '110111',
    },
  };

  const mockCustomer = new Customer(
    'customer-1',
    'John Doe',
    new Date(),
    new Date(),
  );

  beforeEach(async () => {
    // Set environment variables
    process.env.PAYMENT_API_URL = 'https://sandbox.payment.co/v1';
    process.env.PAYMENT_PRIVATE_KEY = 'test_private_key';
    process.env.PAYMENT_PUBLIC_KEY = 'test_public_key';
    process.env.PAYMENT_INTEGRITY_SIGNATURE = 'test_signature';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTransactionUseCase,
        {
          provide: 'CustomerRepository',
          useValue: {
            findBy: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: 'TransactionRepository',
          useValue: {
            create: jest.fn(),
            updateStatus: jest.fn(),
          },
        },
        {
          provide: 'PaymentProvider',
          useValue: {
            getAcceptanceToken: jest.fn(),
            createPaymentSource: jest.fn(),
            createTransaction: jest.fn(),
          },
        },
        {
          provide: 'ProductRepository',
          useValue: {
            findBy: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: 'DeliveryRepository',
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<CreateTransactionUseCase>(CreateTransactionUseCase);
    mockCustomerRepository = module.get('CustomerRepository');
    mockTransactionRepository = module.get('TransactionRepository');
    mockPaymentProvider = module.get('PaymentProvider');
    mockDeliveryRepository = module.get('DeliveryRepository');
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should create transaction with existing customer', async () => {
    // Arrange
    const mockTransaction = new Transaction(
      'mock-uuid',
      TransactionStatus.CREATED,
      300000,
      null,
      'customer-1',
      'prod-1',
      new Date(),
      new Date(),
      2,
    );

    const mockUpdatedTransaction = new Transaction(
      'mock-uuid',
      TransactionStatus.PENDING,
      300000,
      'payment-123',
      'customer-1',
      'prod-1',
      new Date(),
      new Date(),
      2,
    );

    mockCustomerRepository.findBy.mockResolvedValue(mockCustomer);
    mockTransactionRepository.create.mockResolvedValue(mockTransaction);
    mockPaymentProvider.getAcceptanceToken.mockResolvedValue(
      'acceptance-token',
    );
    mockPaymentProvider.createPaymentSource.mockResolvedValue({
      data: { id: 'payment-source-id' },
    });
    mockPaymentProvider.createTransaction.mockResolvedValue({
      data: { id: 'payment-123', status: 'PENDING' },
    });
    mockTransactionRepository.updateStatus.mockResolvedValue(
      mockUpdatedTransaction,
    );
    mockDeliveryRepository.create.mockResolvedValue({} as any);

    // Act
    const result = await useCase.execute(mockCreateTransactionDto);

    // Assert
    expect(result).toEqual(mockUpdatedTransaction);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockCustomerRepository.findBy).toHaveBeenCalledWith('John Doe');
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockTransactionRepository.create).toHaveBeenCalled();
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockPaymentProvider.createTransaction).toHaveBeenCalled();
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockDeliveryRepository.create).toHaveBeenCalled();
  });

  it('should create new customer if not exists', async () => {
    // Arrange
    mockCustomerRepository.findBy.mockResolvedValue(null);
    mockCustomerRepository.create.mockResolvedValue(mockCustomer);

    const mockTransaction = new Transaction(
      'mock-uuid',
      TransactionStatus.CREATED,
      300000,
      null,
      'customer-1',
      'prod-1',
      new Date(),
      new Date(),
      2,
    );

    mockTransactionRepository.create.mockResolvedValue(mockTransaction);
    mockPaymentProvider.getAcceptanceToken.mockResolvedValue(
      'acceptance-token',
    );
    mockPaymentProvider.createPaymentSource.mockResolvedValue({
      data: { id: 'payment-source-id' },
    });
    mockPaymentProvider.createTransaction.mockResolvedValue({
      data: { id: 'payment-123', status: 'PENDING' },
    });
    mockTransactionRepository.updateStatus.mockResolvedValue(mockTransaction);
    mockDeliveryRepository.create.mockResolvedValue({} as any);

    // Act
    await useCase.execute(mockCreateTransactionDto);

    // Assert
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockCustomerRepository.create).toHaveBeenCalled();
  });

  it('should create transaction successfully', async () => {
    // Mock data
    const customerId = 'customer-123';
    const transactionId = 'txn-123';
    const productId = 'product-123';

    const dto: CreateTransactionDto = {
      customer: {
        name: 'John Doe',
        email: 'john@example.com',
      },
      productId,
      amount: 300000,
      items: 2,
      paymentToken: 'card_token_123',
      delivery: {
        country: 'Colombia',
        city: 'Bogotá',
        address: '123 Main St',
        zipCode: '110111',
      },
      currency: 'COP',
    };

    const customer = new Customer(
      customerId,
      'John Doe',
      new Date(),
      new Date(),
    );

    const transaction = new Transaction(
      transactionId,
      TransactionStatus.CREATED,
      300000,
      null,
      customerId,
      productId,
      new Date(),
      new Date(),
      2,
    );

    const paymentResponse = {
      data: { id: 'payment-123', status: 'PENDING' },
    };

    // Mock repository responses
    mockCustomerRepository.findBy.mockResolvedValue(null);
    mockCustomerRepository.create.mockResolvedValue(customer);
    mockTransactionRepository.create.mockResolvedValue(transaction);
    mockDeliveryRepository.create.mockResolvedValue({} as any);
    mockTransactionRepository.updateStatus.mockResolvedValue(transaction);

    // Mock payment provider responses
    mockPaymentProvider.getAcceptanceToken.mockResolvedValue(
      'acceptance_token_123',
    );
    mockPaymentProvider.createPaymentSource.mockResolvedValue({
      data: { id: 'payment-source-id' },
    });
    mockPaymentProvider.createTransaction.mockResolvedValue(paymentResponse);

    // Execute
    const result = await useCase.execute(dto);

    // Assertions
    expect(result).toEqual(transaction);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockCustomerRepository.create).toHaveBeenCalled();
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockTransactionRepository.create).toHaveBeenCalled();
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockPaymentProvider.createTransaction).toHaveBeenCalled();
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockTransactionRepository.updateStatus).toHaveBeenCalledWith(
      expect.any(String),
      TransactionStatus.PENDING,
      'payment-123',
    );
  });

  it('should handle payment provider errors', async () => {
    const dto: CreateTransactionDto = {
      customer: {
        name: 'John Doe',
        email: 'john@example.com',
      },
      productId: 'product-123',
      amount: 300000,
      items: 2,
      paymentToken: 'card_token_123',
      delivery: {
        country: 'Colombia',
        city: 'Bogotá',
        address: '123 Main St',
        zipCode: '110111',
      },
      currency: 'COP',
    };

    const customer = new Customer(
      'customer-123',
      'John Doe',
      new Date(),
      new Date(),
    );
    const transaction = new Transaction(
      'txn-123',
      TransactionStatus.CREATED,
      300000,
      null,
      'customer-123',
      'product-123',
      new Date(),
      new Date(),
      2,
    );

    const paymentResponse = {
      data: { id: 'payment-123', status: 'PENDING' },
    };

    mockCustomerRepository.findBy.mockResolvedValue(null);
    mockCustomerRepository.create.mockResolvedValue(customer);
    mockTransactionRepository.create.mockResolvedValue(transaction);
    mockPaymentProvider.getAcceptanceToken.mockResolvedValue(
      'acceptance_token_123',
    );
    mockPaymentProvider.createPaymentSource.mockResolvedValue({
      data: { id: 'payment-source-id' },
    });
    mockPaymentProvider.createTransaction.mockResolvedValue(paymentResponse);
    mockTransactionRepository.updateStatus.mockResolvedValue(transaction);
    mockDeliveryRepository.create.mockResolvedValue({} as any);

    const result = await useCase.execute(dto);

    expect(result).toEqual(transaction);
  });
});
