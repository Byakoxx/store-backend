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
    // Check if we have database connection
    const hasDatabase = this.hasDatabaseConnection();

    // Temporary debugging
    console.log('🔍 DEBUG - DATABASE_URL exists:', !!process.env.DATABASE_URL);
    console.log(
      '🔍 DEBUG - DATABASE_URL:',
      process.env.DATABASE_URL?.substring(0, 50) + '...',
    );
    console.log('🔍 DEBUG - Has database connection:', hasDatabase);

    if (!hasDatabase) {
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

  private hasDatabaseConnection(): boolean {
    const databaseUrl = process.env.DATABASE_URL;

    // If no DATABASE_URL at all
    if (!databaseUrl) {
      return false;
    }

    // If DATABASE_URL points to localhost, it won't work in Railway
    if (databaseUrl.includes('localhost')) {
      console.log('🚨 DATABASE_URL points to localhost, not usable in Railway');
      return false;
    }

    return true;
  }

  async findById(id: string): Promise<Product | null> {
    if (!process.env.DATABASE_URL) {
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
    if (!process.env.DATABASE_URL) {
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
