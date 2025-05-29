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
    // Reset environment variables
    process.env.WOMPI_API_URL = 'https://sandbox.wompi.co/v1';
    process.env.WOMPI_PRIVATE_KEY = 'test_private_key';
    process.env.WOMPI_INTEGRITY_SIGNATURE = 'test_signature';

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
          provide: 'PaymentProviderPort',
          useValue: {
            getAcceptanceToken: jest.fn(),
            createPaymentSource: jest.fn(),
            createTransaction: jest.fn(),
          },
        },
        {
          provide: 'ProductRepository',
          useValue: {
            decreaseStock: jest.fn(),
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
    mockPaymentProvider = module.get('PaymentProviderPort');
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
      'wompi-123',
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
      data: { id: 'wompi-123', status: 'PENDING' },
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
      data: { id: 'wompi-123', status: 'PENDING' },
    });
    mockTransactionRepository.updateStatus.mockResolvedValue(mockTransaction);
    mockDeliveryRepository.create.mockResolvedValue({} as any);

    // Act
    await useCase.execute(mockCreateTransactionDto);

    // Assert
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockCustomerRepository.create).toHaveBeenCalled();
  });
});
