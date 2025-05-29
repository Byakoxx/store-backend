/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { DeliveryController } from './delivery.controller';
import { DeliveryRepository } from 'src/domain/ports-out/delivery.repository';
import { Delivery } from 'src/domain/models/delivery.entity';
import { DeliveryStatus } from 'src/domain/models/delivery-status.enum';
import { NotFoundException } from '@nestjs/common';

describe('DeliveryController', () => {
  let controller: DeliveryController;
  let mockDeliveryRepository: jest.Mocked<DeliveryRepository>;

  const mockDelivery = new Delivery(
    'delivery-1',
    DeliveryStatus.CREATED,
    'Colombia',
    'Bogotá',
    'Calle 123 #45-67',
    '110111',
    null,
    'transaction-1',
    new Date('2024-01-01'),
    new Date('2024-01-01'),
    'customer-1',
  );

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeliveryController],
      providers: [
        {
          provide: 'DeliveryRepository',
          useValue: {
            findByTransactionId: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<DeliveryController>(DeliveryController);
    mockDeliveryRepository = module.get('DeliveryRepository');
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getByTransactionId', () => {
    it('should return delivery when found', async () => {
      mockDeliveryRepository.findByTransactionId.mockResolvedValue(
        mockDelivery,
      );

      const result = await controller.getByTransactionId('transaction-1');

      expect(result).toBe(mockDelivery);
      expect(mockDeliveryRepository.findByTransactionId).toHaveBeenCalledWith(
        'transaction-1',
      );
    });

    it('should throw NotFoundException when delivery not found', async () => {
      mockDeliveryRepository.findByTransactionId.mockResolvedValue(null);

      await expect(
        controller.getByTransactionId('non-existent'),
      ).rejects.toThrow(NotFoundException);
      expect(mockDeliveryRepository.findByTransactionId).toHaveBeenCalledWith(
        'non-existent',
      );
    });
  });
});
