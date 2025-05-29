import { Injectable } from '@nestjs/common';
import { Product } from 'src/domain/models/product.entity';
import { ProductRepository } from 'src/domain/ports-out/product.repository';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductPrismaRepository implements ProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Product[]> {
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
