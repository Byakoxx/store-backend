import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductRepository } from 'src/domain/ports-out/product.repository';
import { ProductService } from '../ports-in/product-service-interface';
import { Product } from 'src/domain/models/product.entity';

@Injectable()
export class ProductServiceImpl implements ProductService {
  constructor(private readonly productRepository: ProductRepository) {}

  async getAll(): Promise<Product[]> {
    return this.productRepository.findAll();
  }

  async getById(id: string): Promise<Product> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }
}
