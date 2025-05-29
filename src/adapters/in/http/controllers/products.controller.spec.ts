import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductService } from 'src/application/ports-in/product-service-interface';
import { Product } from 'src/domain/models/product.entity';

describe('ProductsController', () => {
  let controller: ProductsController;
  let mockProductService: jest.Mocked<ProductService>;

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
    const mockService = {
      getAll: jest.fn(),
      getById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: 'ProductService',
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    mockProductService = module.get('ProductService');
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of product DTOs', async () => {
      const products = [mockProduct];
      mockProductService.getAll.mockResolvedValue(products);

      const result = await controller.findAll();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 'prod-1',
        name: 'Test Product',
        description: 'Test Description',
        price: 99.99,
        stock: 10,
        image: 'https://example.com/image.jpg',
        createdAt: mockProduct.createdAt,
        updatedAt: mockProduct.updatedAt,
      });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockProductService.getAll).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no products', async () => {
      mockProductService.getAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockProductService.getAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findById', () => {
    it('should return a product DTO when found', async () => {
      mockProductService.getById.mockResolvedValue(mockProduct);

      const result = await controller.findById('prod-1');

      expect(result).toEqual({
        id: 'prod-1',
        name: 'Test Product',
        description: 'Test Description',
        price: 99.99,
        stock: 10,
        image: 'https://example.com/image.jpg',
        createdAt: mockProduct.createdAt,
        updatedAt: mockProduct.updatedAt,
      });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockProductService.getById).toHaveBeenCalledWith('prod-1');
    });

    it('should return null when product not found', async () => {
      mockProductService.getById.mockResolvedValue(null as unknown as Product);

      const result = await controller.findById('non-existent');

      expect(result).toBeNull();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockProductService.getById).toHaveBeenCalledWith('non-existent');
    });
  });
});
