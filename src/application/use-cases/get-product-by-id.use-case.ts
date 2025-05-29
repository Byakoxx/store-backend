import { Product } from 'src/domain/models/product.entity';
import { ProductRepository } from 'src/domain/ports-out/product.repository';

export class GetProductByIdUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(id: string): Promise<Product | null> {
    return this.productRepository.findById(id);
  }
}
