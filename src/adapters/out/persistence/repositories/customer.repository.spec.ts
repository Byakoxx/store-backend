import { Test, TestingModule } from '@nestjs/testing';
import { CustomerPrismaRepository } from './customer.repository';
import { PrismaService } from '../prisma/prisma.service';
import { Customer } from 'src/domain/models/customer.entity';

describe('CustomerPrismaRepository', () => {
  let repository: CustomerPrismaRepository;
  let mockPrismaService: any;

  const mockPrismaCustomer = {
    id: 'customer-1',
    name: 'John Doe',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  beforeEach(async () => {
    mockPrismaService = {
      customer: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerPrismaRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<CustomerPrismaRepository>(CustomerPrismaRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findBy', () => {
    it('should return a customer when found', async () => {
      mockPrismaService.customer.findUnique.mockResolvedValue(
        mockPrismaCustomer,
      );

      const result = await repository.findBy('customer-1');

      expect(result).toBeInstanceOf(Customer);
      expect(result?.id).toBe('customer-1');
      expect(mockPrismaService.customer.findUnique).toHaveBeenCalledWith({
        where: { id: 'customer-1' },
      });
    });

    it('should return null when customer not found', async () => {
      mockPrismaService.customer.findUnique.mockResolvedValue(null);

      const result = await repository.findBy('non-existent');

      expect(result).toBeNull();
      expect(mockPrismaService.customer.findUnique).toHaveBeenCalledWith({
        where: { id: 'non-existent' },
      });
    });
  });

  describe('findByName', () => {
    it('should return a customer when found', async () => {
      mockPrismaService.customer.findFirst.mockResolvedValue(
        mockPrismaCustomer,
      );

      const result = await repository.findByName('John Doe');

      expect(result).toBeInstanceOf(Customer);
      expect(result?.name).toBe('John Doe');
      expect(mockPrismaService.customer.findFirst).toHaveBeenCalledWith({
        where: { name: 'John Doe' },
      });
    });

    it('should return null when customer not found', async () => {
      mockPrismaService.customer.findFirst.mockResolvedValue(null);

      const result = await repository.findByName('Non Existent');

      expect(result).toBeNull();
      expect(mockPrismaService.customer.findFirst).toHaveBeenCalledWith({
        where: { name: 'Non Existent' },
      });
    });
  });

  describe('create', () => {
    it('should create a customer successfully', async () => {
      mockPrismaService.customer.create.mockResolvedValue(mockPrismaCustomer);

      const customerData = new Customer(
        'customer-1',
        'John Doe',
        new Date('2024-01-01'),
        new Date('2024-01-01'),
      );

      const result = await repository.create(customerData);

      expect(result).toBeInstanceOf(Customer);
      expect(result.id).toBe('customer-1');
      expect(mockPrismaService.customer.create).toHaveBeenCalledWith({
        data: {
          id: customerData.id,
          name: customerData.name,
          createdAt: customerData.createdAt,
          updatedAt: customerData.updatedAt,
        },
      });
    });
  });
});
