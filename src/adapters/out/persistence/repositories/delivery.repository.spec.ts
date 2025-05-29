import { Test, TestingModule } from '@nestjs/testing';
import { DeliveryPrismaRepository } from './delivery.repository';
import { PrismaService } from '../prisma/prisma.service';
import { Delivery } from 'src/domain/models/delivery.entity';
import { DeliveryStatus } from 'src/domain/models/delivery-status.enum';

describe('DeliveryPrismaRepository', () => {
  let repository: DeliveryPrismaRepository;
  let mockPrismaService: any;

  const mockPrismaDelivery = {
    id: 'delivery-1',
    transactionId: 'txn-1',
    status: 'CREATED',
    address: '123 Main St',
    country: 'USA',
    city: 'New York',
    zipCode: '10001',
    trackingCode: null,
    customerId: 'customer-1',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  beforeEach(async () => {
    mockPrismaService = {
      delivery: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeliveryPrismaRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<DeliveryPrismaRepository>(DeliveryPrismaRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create a delivery successfully', async () => {
      mockPrismaService.delivery.create.mockResolvedValue(mockPrismaDelivery);

      const deliveryData = new Delivery(
        'delivery-1',
        DeliveryStatus.CREATED,
        'USA',
        'New York',
        '123 Main St',
        '10001',
        null,
        'txn-1',
        new Date('2024-01-01'),
        new Date('2024-01-01'),
        'customer-1',
      );

      const result = await repository.create(deliveryData);

      expect(result).toBeInstanceOf(Delivery);
      expect(result.id).toBe('delivery-1');
      expect(mockPrismaService.delivery.create).toHaveBeenCalledWith({
        data: {
          id: deliveryData.id,
          transactionId: deliveryData.transactionId,
          status: deliveryData.status,
          address: deliveryData.address,
          country: deliveryData.country,
          city: deliveryData.city,
          zipCode: deliveryData.zipCode,
          trackingCode: deliveryData.trackingCode,
          customerId: deliveryData.customerId,
          createdAt: deliveryData.createdAt,
          updatedAt: deliveryData.updatedAt,
        },
      });
    });
  });

  describe('findByTransactionId', () => {
    it('should return a delivery when found', async () => {
      mockPrismaService.delivery.findUnique.mockResolvedValue(
        mockPrismaDelivery,
      );

      const result = await repository.findByTransactionId('txn-1');

      expect(result).toBeInstanceOf(Delivery);
      expect(result?.transactionId).toBe('txn-1');
      expect(mockPrismaService.delivery.findUnique).toHaveBeenCalledWith({
        where: { transactionId: 'txn-1' },
      });
    });

    it('should return null when delivery not found', async () => {
      mockPrismaService.delivery.findUnique.mockResolvedValue(null);

      const result = await repository.findByTransactionId('non-existent');

      expect(result).toBeNull();
      expect(mockPrismaService.delivery.findUnique).toHaveBeenCalledWith({
        where: { transactionId: 'non-existent' },
      });
    });
  });

  describe('updateStatus', () => {
    it('should update delivery status successfully', async () => {
      const updatedDelivery = {
        ...mockPrismaDelivery,
        status: 'PREPARING',
      };
      mockPrismaService.delivery.update.mockResolvedValue(updatedDelivery);

      const result = await repository.updateStatus(
        'txn-1',
        DeliveryStatus.PREPARING,
      );

      expect(result).toBeInstanceOf(Delivery);
      expect(mockPrismaService.delivery.update).toHaveBeenCalledWith({
        where: { transactionId: 'txn-1' },
        data: {
          status: DeliveryStatus.PREPARING,
          updatedAt: expect.any(Date),
        },
      });
    });

    it('should return null when update fails', async () => {
      mockPrismaService.delivery.update.mockRejectedValue(
        new Error('Update failed'),
      );

      const result = await repository.updateStatus(
        'non-existent',
        DeliveryStatus.PREPARING,
      );

      expect(result).toBeNull();
    });
  });
});
