import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProductServiceImpl } from './product.service';
import { ProductRepository } from 'src/domain/ports-out/product.repository';
import { Product } from 'src/domain/models/product.entity';

describe('ProductServiceImpl', () => {
  let service: ProductServiceImpl;
  let mockProductRepository: jest.Mocked<ProductRepository>;

  const mockProduct = new Product(
    'prod-1',
    'Test Product',
    'Test Description',
    99.99,
    10,
    'https://example.com/image.jpg',
    new Date('2024-01-01'),
    new Date('2024-01-01'),
  );

  beforeEach(async () => {
    const mockRepo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      decreaseStock: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductServiceImpl,
        {
          provide: 'ProductRepository',
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<ProductServiceImpl>(ProductServiceImpl);
    mockProductRepository = module.get('ProductRepository');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAll', () => {
    it('should return an array of products', async () => {
      const products = [mockProduct];
      mockProductRepository.findAll.mockResolvedValue(products);

      const result = await service.getAll();

      expect(result).toEqual(products);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockProductRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no products', async () => {
      mockProductRepository.findAll.mockResolvedValue([]);

      const result = await service.getAll();

      expect(result).toEqual([]);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockProductRepository.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('getById', () => {
    it('should return a product when found', async () => {
      mockProductRepository.findById.mockResolvedValue(mockProduct);

      const result = await service.getById('prod-1');

      expect(result).toEqual(mockProduct);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockProductRepository.findById).toHaveBeenCalledWith('prod-1');
    });

    it('should throw NotFoundException when product not found', async () => {
      mockProductRepository.findById.mockResolvedValue(null);

      await expect(service.getById('non-existent')).rejects.toThrow(
        NotFoundException,
      );
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockProductRepository.findById).toHaveBeenCalledWith(
        'non-existent',
      );
    });
  });
});
