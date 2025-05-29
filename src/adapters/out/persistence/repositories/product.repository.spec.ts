import { Test, TestingModule } from '@nestjs/testing';
import { ProductPrismaRepository } from './product.repository';
import { PrismaService } from '../prisma/prisma.service';
import { Product } from 'src/domain/models/product.entity';

describe('ProductPrismaRepository', () => {
  let repository: ProductPrismaRepository;
  let mockPrismaService: any;

  const mockPrismaProduct = {
    id: 'prod-1',
    name: 'Test Product',
    description: 'Test Description',
    price: 99.99,
    stock: 10,
    image: 'https://example.com/image.jpg',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  beforeEach(async () => {
    mockPrismaService = {
      product: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductPrismaRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<ProductPrismaRepository>(ProductPrismaRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of products', async () => {
      mockPrismaService.product.findMany.mockResolvedValue([mockPrismaProduct]);

      const result = await repository.findAll();

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Product);
      expect(result[0].id).toBe('prod-1');
      expect(mockPrismaService.product.findMany).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no products found', async () => {
      mockPrismaService.product.findMany.mockResolvedValue([]);

      const result = await repository.findAll();

      expect(result).toEqual([]);
      expect(mockPrismaService.product.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('findById', () => {
    it('should return a product when found', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(mockPrismaProduct);

      const result = await repository.findById('prod-1');

      expect(result).toBeInstanceOf(Product);
      expect(result?.id).toBe('prod-1');
      expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: 'prod-1' },
      });
    });

    it('should return null when product not found', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      const result = await repository.findById('non-existent');

      expect(result).toBeNull();
      expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: 'non-existent' },
      });
    });
  });

  describe('decreaseStock', () => {
    it('should decrease product stock successfully', async () => {
      mockPrismaService.product.update.mockResolvedValue(mockPrismaProduct);

      await repository.decreaseStock('prod-1', 2);

      expect(mockPrismaService.product.update).toHaveBeenCalledWith({
        where: { id: 'prod-1' },
        data: { stock: { decrement: 2 } },
      });
    });

    it('should handle stock decrease with zero quantity', async () => {
      mockPrismaService.product.update.mockResolvedValue(mockPrismaProduct);

      await repository.decreaseStock('prod-1', 0);

      expect(mockPrismaService.product.update).toHaveBeenCalledWith({
        where: { id: 'prod-1' },
        data: { stock: { decrement: 0 } },
      });
    });
  });
});
