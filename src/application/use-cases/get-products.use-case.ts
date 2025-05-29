import { Product } from 'src/domain/models/product.entity';
import { ProductRepository } from 'src/domain/ports-out/product.repository';

export class GetProductsUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(): Promise<Product[]> {
    return this.productRepository.findAll();
  }
}
