import { Injectable } from '@nestjs/common';
import { Product } from '../../../../domain/models/product.entity';
import { ProductRepository } from '../../../../domain/ports-out/product.repository';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductPrismaRepository implements ProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  private getMockProducts(): Product[] {
    return [
      new Product(
        '1',
        'Mock Product 1',
        'A sample product for testing',
        29.99,
        100,
        'https://via.placeholder.com/300',
        new Date(),
        new Date(),
      ),
      new Product(
        '2',
        'Mock Product 2',
        'Another sample product',
        49.99,
        50,
        'https://via.placeholder.com/300',
        new Date(),
        new Date(),
      ),
    ];
  }

  async findAll(): Promise<Product[]> {
    if (!this.prisma) {
      console.log('🔄 Using mock products (no database)');
      return this.getMockProducts();
    }

    const products = await this.prisma.product.findMany();

    return products.map(
      (p) =>
        new Product(
          p.id,
          p.name,
          p.description,
          p.price,
          p.stock,
          p.image,
          p.createdAt,
          p.updatedAt,
        ),
    );
  }

  async findById(id: string): Promise<Product | null> {
    if (!this.prisma) {
      console.log(`🔄 Using mock product for ID ${id} (no database)`);
      const mockProducts = this.getMockProducts();
      return mockProducts.find((p) => p.id === id) || null;
    }

    const p = await this.prisma.product.findUnique({ where: { id } });
    if (!p) return null;

    return new Product(
      p.id,
      p.name,
      p.description,
      p.price,
      p.stock,
      p.image,
      p.createdAt,
      p.updatedAt,
    );
  }

  async decreaseStock(productId: string, quantity: number): Promise<void> {
    if (!this.prisma) {
      console.log(
        `🔄 Mock decrease stock for product ${productId} by ${quantity} (no database)`,
      );
      return;
    }

    await this.prisma.product.update({
      where: { id: productId },
      data: {
        stock: {
          decrement: quantity,
        },
      },
    });
  }
}
